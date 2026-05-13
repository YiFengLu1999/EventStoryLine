from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
ANNOTATED_DIR = ROOT / "annotated_data" / "v1.5"
ECB_DIR = ROOT / "ECB+_LREC2014" / "ECB+"
OUT = Path(__file__).resolve().parent / "data" / "v15_index.json"
OUT_JS = Path(__file__).resolve().parent / "data" / "v15_data.js"


EVENT_PREFIXES = ("ACTION", "NEG_ACTION")
TIME_PREFIXES = ("TIME_",)
ENTITY_PREFIXES = ("HUMAN_PART", "NON_HUMAN_PART", "LOC_", "UNKNOWN")
PUNCT_NO_SPACE_BEFORE = {".", ",", ":", ";", "?", "!", "%", ")", "]", "}", "'", '"'}
PUNCT_NO_SPACE_AFTER = {"(", "[", "{", "$", "#", '"'}


def text_join(tokens: list[str]) -> str:
    text = ""
    prev = ""
    for tok in tokens:
        if not text:
            text = tok
        elif tok in PUNCT_NO_SPACE_BEFORE or prev in PUNCT_NO_SPACE_AFTER:
            text += tok
        elif tok in {"n't", "'s", "'re", "'ve", "'ll", "'d", "'m"}:
            text += tok
        elif tok == "-" or prev == "-":
            text += tok
        elif tok == "/":
            text += tok
        elif prev == "/":
            text += tok
        else:
            text += " " + tok
        prev = tok
    return text


def category(tag: str) -> str:
    if tag.startswith(EVENT_PREFIXES):
        return "event"
    if tag.startswith(TIME_PREFIXES):
        return "time"
    if tag.startswith(ENTITY_PREFIXES):
        return "entity"
    return "other"


def safe_parse(path: Path):
    parser = ET.XMLParser(encoding="utf-8")
    return ET.parse(path, parser=parser).getroot()


def read_cross_doc(topic: str, doc_name: str) -> dict[str, dict]:
    source = ECB_DIR / topic / doc_name
    if not source.exists():
        return {}

    root = safe_parse(source)
    clusters: dict[str, dict] = {}
    for rel in root.findall("./Relations/CROSS_DOC_COREF"):
        note = rel.attrib.get("note", "")
        sources = [s.attrib.get("m_id") for s in rel.findall("source") if s.attrib.get("m_id")]
        targets = [t.attrib.get("m_id") for t in rel.findall("target") if t.attrib.get("m_id")]
        if note:
            clusters[note] = {
                "id": rel.attrib.get("r_id", ""),
                "note": note,
                "sources": sources,
                "targets": targets,
            }
    return clusters


def parse_doc(path: Path) -> dict:
    root = safe_parse(path)
    topic = path.parent.name
    doc_name = root.attrib.get("doc_name", path.name.replace(".xml.xml", ".xml"))
    doc_id = f"{topic}/{doc_name}"

    tokens = []
    sentences: dict[str, list[dict]] = defaultdict(list)
    token_text: dict[str, str] = {}
    token_sentence: dict[str, str] = {}
    for tok in root.findall("token"):
        tid = tok.attrib["t_id"]
        item = {
            "id": tid,
            "sentence": tok.attrib.get("sentence", "0"),
            "number": tok.attrib.get("number", "0"),
            "text": tok.text or "",
        }
        tokens.append(item)
        sentences[item["sentence"]].append(item)
        token_text[tid] = item["text"]
        token_sentence[tid] = item["sentence"]

    sentence_items = []
    for sid in sorted(sentences, key=lambda x: int(x) if x.isdigit() else x):
        sentence_items.append({
            "id": sid,
            "tokens": [t["id"] for t in sentences[sid]],
            "text": text_join([t["text"] for t in sentences[sid]]),
        })

    markables: dict[str, dict] = {}
    for mark in root.findall("./Markables/*"):
        mid = mark.attrib.get("m_id")
        if not mid:
            continue
        anchors = [a.attrib.get("t_id") for a in mark.findall("token_anchor") if a.attrib.get("t_id")]
        sentence_ids = sorted({token_sentence[t] for t in anchors if t in token_sentence}, key=lambda x: int(x) if x.isdigit() else x)
        markables[mid] = {
            "id": mid,
            "tag": mark.tag,
            "category": category(mark.tag),
            "tokens": anchors,
            "text": text_join([token_text[t] for t in anchors if t in token_text]),
            "sentences": sentence_ids,
            "attrs": {k: v for k, v in mark.attrib.items() if k != "m_id"},
        }

    relations = []
    relation_counts = Counter()
    relation_type_counts = Counter()
    for rel in root.findall("./Relations/*"):
        rid = rel.attrib.get("r_id", "")
        tag = rel.tag
        sources = [s.attrib.get("m_id") for s in rel.findall("source") if s.attrib.get("m_id")]
        targets = [t.attrib.get("m_id") for t in rel.findall("target") if t.attrib.get("m_id")]
        relation_counts[tag] += 1
        relation_type_counts[f"{tag}:{rel.attrib.get('relType', '')}"] += 1
        relations.append({
            "id": rid,
            "tag": tag,
            "type": rel.attrib.get("relType", ""),
            "sources": sources,
            "targets": targets,
            "attrs": {k: v for k, v in rel.attrib.items() if k not in {"r_id", "relType"}},
        })

    cross_doc = read_cross_doc(topic, doc_name)
    for note, cluster in cross_doc.items():
        for mid in cluster["sources"] + cluster["targets"]:
            if mid in markables:
                markables[mid]["crossDocNote"] = note

    title = ""
    for sentence in sentence_items:
        if sentence["id"] != "0":
            title = sentence["text"]
            break
    if not title and sentence_items:
        title = sentence_items[0]["text"]

    event_count = sum(1 for m in markables.values() if m["category"] == "event")
    time_count = sum(1 for m in markables.values() if m["category"] == "time")
    linked_markables = {mid for r in relations for mid in r["sources"] + r["targets"]}
    events_without_time = [
        m["id"] for m in markables.values()
        if m["category"] == "event"
        and not any(r["tag"] == "TLINK" and m["id"] in r["sources"] + r["targets"] for r in relations)
    ]

    return {
        "id": doc_id,
        "topic": topic,
        "docName": doc_name,
        "title": title,
        "path": str(path.relative_to(ROOT)),
        "tokens": tokens,
        "sentences": sentence_items,
        "markables": list(markables.values()),
        "relations": relations,
        "crossDoc": list(cross_doc.values()),
        "stats": {
            "tokens": len(tokens),
            "sentences": len(sentence_items),
            "markables": len(markables),
            "events": event_count,
            "times": time_count,
            "relations": len(relations),
            "plotLinks": relation_counts["PLOT_LINK"],
            "tlinks": relation_counts["TLINK"],
            "crossDocClusters": len(cross_doc),
            "eventsWithoutTLINK": len(events_without_time),
            "linkedMarkables": len(linked_markables),
        },
        "relationCounts": dict(relation_counts),
        "relationTypeCounts": dict(relation_type_counts),
    }


def doc_sort_key(path: Path) -> tuple[int, int, str]:
    stem = path.name.replace(".xml.xml", "")
    parts = stem.split("_", 1)
    doc_num = 0
    if len(parts) > 1:
        digits = "".join(ch for ch in parts[1] if ch.isdigit())
        doc_num = int(digits) if digits else 0
    return int(path.parent.name), doc_num, path.name


def main() -> None:
    docs = []
    for path in sorted(ANNOTATED_DIR.glob("*/*.xml.xml"), key=doc_sort_key):
        docs.append(parse_doc(path))

    topics: dict[str, dict] = {}
    total = Counter()
    for doc in docs:
        topic = topics.setdefault(doc["topic"], {
            "id": doc["topic"],
            "docs": [],
            "stats": Counter(),
        })
        topic["docs"].append({
            "id": doc["id"],
            "docName": doc["docName"],
            "title": doc["title"],
            "stats": doc["stats"],
        })
        topic["stats"].update(doc["stats"])
        total.update(doc["stats"])

    payload = {
        "generatedFrom": "annotated_data/v1.5 plus ECB+_LREC2014 cross-doc coreference",
        "docCount": len(docs),
        "topicCount": len(topics),
        "stats": dict(total),
        "topics": [
            {
                "id": tid,
                "docs": value["docs"],
                "stats": dict(value["stats"]),
            }
            for tid, value in sorted(topics.items(), key=lambda kv: int(kv[0]))
        ],
        "docs": docs,
    }
    packed = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    OUT.write_text(packed, encoding="utf-8")
    OUT_JS.write_text("window.V15_DATA=" + packed + ";\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} and {OUT_JS.relative_to(ROOT)} with {len(docs)} docs.")


if __name__ == "__main__":
    main()
