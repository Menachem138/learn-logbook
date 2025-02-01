import json
import os
import pytest
from pathlib import Path

def test_translated_segments_structure():
    """Vérifie la structure du fichier translated_segments.json"""
    with open('translated_segments.json', 'r', encoding='utf-8') as f:
        segments = json.load(f)
    
    assert isinstance(segments, list), "Les segments doivent être dans une liste"
    assert len(segments) == 17, "Il devrait y avoir 17 segments"
    
    for segment in segments:
        assert isinstance(segment, dict), "Chaque segment doit être un dictionnaire"
        assert "start" in segment, "Chaque segment doit avoir un temps de début"
        assert "end" in segment, "Chaque segment doit avoir un temps de fin"
        assert "hebrew" in segment, "Chaque segment doit avoir du texte hébreu"
        assert "french" in segment, "Chaque segment doit avoir une traduction française"
        
        assert isinstance(segment["start"], (int, float)), "Le temps de début doit être un nombre"
        assert isinstance(segment["end"], (int, float)), "Le temps de fin doit être un nombre"
        assert isinstance(segment["hebrew"], str), "Le texte hébreu doit être une chaîne"
        assert isinstance(segment["french"], str), "La traduction doit être une chaîne"
        
        assert segment["start"] < segment["end"], "Le temps de début doit être inférieur au temps de fin"
        assert len(segment["hebrew"]) > 0, "Le texte hébreu ne doit pas être vide"
        assert len(segment["french"]) > 0, "La traduction ne doit pas être vide"

def test_hebrew_text_quality():
    """Vérifie la qualité du texte hébreu"""
    with open('translated_segments.json', 'r', encoding='utf-8') as f:
        segments = json.load(f)
    
    important_terms = {
        'תורה': 'תּוֹרָה',
        'מצוה': 'מִצְוָה',
        'הלכה': 'הֲלָכָה',
        'תפילה': 'תְּפִלָּה',
        'ברכה': 'בְּרָכָה',
        'שבת': 'שַׁבָּת',
        'אבל': 'אָבֵל',
        'שבעה': 'שִׁבְעָה',
        'אבלות': 'אֲבֵלוּת'
    }
    
    for segment in segments:
        hebrew_text = segment["hebrew"]
        for term, niqqud in important_terms.items():
            if term in hebrew_text:
                assert niqqud in hebrew_text, f"Le terme '{term}' devrait avoir les points-voyelles: '{niqqud}'"

def test_french_translation_quality():
    """Vérifie la qualité des traductions françaises"""
    with open('translated_segments.json', 'r', encoding='utf-8') as f:
        segments = json.load(f)
    
    terms_map = {
        'בֵּית הַכְּנֶסֶת': 'synagogue',
        'תּוֹרָה': 'Torah',
        'הֲלָכָה': 'Halakha',
        'מִצְוָה': 'Mitsva',
        'אָבֵל': 'endeuillé',
        'אֲבֵלוּת': 'deuil',
        'שִׁבְעָה': 'Chiva'
    }
    
    for segment in segments:
        hebrew = segment["hebrew"]
        french = segment["french"].lower()
        
        for heb_term, fr_term in terms_map.items():
            if heb_term in hebrew:
                assert fr_term.lower() in french, f"La traduction de '{heb_term}' devrait contenir '{fr_term}'"

def test_cache_functionality():
    """Vérifie que les fichiers nécessaires au cache sont présents"""
    dist_path = Path('dist')
    assert dist_path.exists(), "Le dossier dist doit exister"
    
    required_files = ['index.html', 'script.js', 'styles.css', 'translated_segments.json']
    for file in required_files:
        assert (dist_path / file).exists(), f"Le fichier {file} doit exister dans le dossier dist"
    
    with open(dist_path / 'translated_segments.json', 'r', encoding='utf-8') as f:
        cached_segments = json.load(f)
    
    with open('translated_segments.json', 'r', encoding='utf-8') as f:
        original_segments = json.load(f)
    
    assert cached_segments == original_segments, "Les segments en cache doivent être identiques aux segments originaux"
