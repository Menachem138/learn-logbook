import json
import re
from typing import Dict, List, Optional

def load_json_file(filepath: str) -> dict:
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def split_hebrew_text(text: str) -> List[str]:
    sentences = []
    current = []
    
    for line in text.split('.'):
        line = line.strip()
        if not line:
            continue
            
        if len(' '.join(current + [line])) > 100:
            if current:
                sentences.append('. '.join(current) + '.')
                current = []
        current.append(line)
        
    if current:
        sentences.append('. '.join(current) + '.')
    return sentences

def extract_flat_segments(structured_text: dict) -> List[Dict[str, str]]:
    segments = []
    
    for section in structured_text["sections"]:
        for subsection in section["subsections"]:
            content = subsection["content"]
            hebrew_parts = split_hebrew_text(content["hebrew"])
            french_parts = content["french"].split('.')
            french_parts = [p.strip() + '.' for p in french_parts if p.strip()]
            
            # Ensure we have matching number of parts
            min_parts = min(len(hebrew_parts), len(french_parts))
            
            for i in range(min_parts):
                segment = {
                    "hebrew": hebrew_parts[i],
                    "french": french_parts[i],
                    "section_title": section["title"],
                    "source": subsection.get("source", "")
                }
                segments.append(segment)
    
    return segments

def estimate_segment_duration(hebrew_text: str) -> float:
    words = len(re.findall(r'\S+', hebrew_text))
    return max(3.0, min(words * 0.5, 10.0))

def map_segments_to_timestamps(new_segments: List[dict], 
                             old_segments: List[dict]) -> List[dict]:
    mapped_segments = []
    current_time = old_segments[0]["start"]
    
    for new_seg in new_segments:
        duration = estimate_segment_duration(new_seg["hebrew"])
        
        mapped_seg = {
            "start": round(current_time, 3),
            "end": round(current_time + duration, 3),
            "hebrew": new_seg["hebrew"],
            "french": new_seg["french"],
            "section_title": new_seg["section_title"],
            "source": new_seg["source"]
        }
        mapped_segments.append(mapped_seg)
        current_time += duration + 0.5  # Add 0.5s gap between segments
    
    return mapped_segments

def main():
    new_text = load_json_file("new_corrected_torah_text.json")
    old_segments = load_json_file("translated_segments.json")
    
    flat_segments = extract_flat_segments(new_text)
    mapped_segments = map_segments_to_timestamps(flat_segments, old_segments)
    
    with open("mapped_segments.json", "w", encoding="utf-8") as f:
        json.dump(mapped_segments, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
