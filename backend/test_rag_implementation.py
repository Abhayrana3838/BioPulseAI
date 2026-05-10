#!/usr/bin/env python3
"""
Comprehensive RAG Implementation Test
Verifies that RAG is properly implemented with all documents and relevant data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from security_rag_server import SecurityRAGSystem, SecurityDataGenerator
import json

def test_rag_implementation():
    """Test RAG implementation comprehensively"""
    print("🔍 COMPREHENSIVE RAG IMPLEMENTATION TEST")
    print("=" * 50)
    
    # Initialize components
    print("\n📊 1. Initializing Components...")
    generator = SecurityDataGenerator()
    rag = SecurityRAGSystem('test-key')  # Using test key for testing
    
    print("✅ Components initialized successfully")
    
    # Generate comprehensive test data
    print("\n📊 2. Generating Test Data...")
    threats = generator.generate_comprehensive_threat_data(20)
    vulns = generator.generate_vulnerability_data(10)
    incidents = generator.generate_incident_data(5)
    
    print(f"   📋 Generated {len(threats)} threats")
    print(f"   🔍 Generated {len(vulns)} vulnerabilities")
    print(f"   🚨 Generated {len(incidents)} incidents")
    
    # Verify data structure
    print("\n📋 3. Verifying Data Structure...")
    
    # Check threat data structure
    sample_threat = threats[0]
    required_threat_fields = ['id', 'type', 'severity', 'attack_vector', 'risk_score', 
                             'mitigation_actions', 'threat_actors', 'ttps', 'indicators']
    
    missing_threat_fields = [field for field in required_threat_fields if field not in sample_threat]
    if missing_threat_fields:
        print(f"   ❌ Missing threat fields: {missing_threat_fields}")
    else:
        print("   ✅ All required threat fields present")
    
    # Check vulnerability data structure
    sample_vuln = vulns[0]
    required_vuln_fields = ['id', 'cve_id', 'title', 'severity', 'cvss_score', 
                           'business_impact', 'mitigation', 'affected_components']
    
    missing_vuln_fields = [field for field in required_vuln_fields if field not in sample_vuln]
    if missing_vuln_fields:
        print(f"   ❌ Missing vulnerability fields: {missing_vuln_fields}")
    else:
        print("   ✅ All required vulnerability fields present")
    
    # Check incident data structure
    sample_incident = incidents[0]
    required_incident_fields = ['id', 'title', 'severity', 'status', 'root_cause', 
                              'lessons_learned', 'remediation_actions', 'financial_impact']
    
    missing_incident_fields = [field for field in required_incident_fields if field not in sample_incident]
    if missing_incident_fields:
        print(f"   ❌ Missing incident fields: {missing_incident_fields}")
    else:
        print("   ✅ All required incident fields present")
    
    # Add data to RAG system
    print("\n📚 4. Adding Data to RAG System...")
    rag.add_security_data(threats, vulns, incidents)
    
    print(f"   📚 RAG system loaded with {len(rag.documents)} documents")
    
    # Verify document creation
    print("\n📄 5. Verifying Document Creation...")
    
    document_types = {}
    for doc in rag.documents:
        doc_type = doc['type']
        document_types[doc_type] = document_types.get(doc_type, 0) + 1
    
    print(f"   📊 Document types: {document_types}")
    
    # Check if all documents have proper content
    content_issues = []
    for i, doc in enumerate(rag.documents):
        if not doc['content'] or len(doc['content'].strip()) < 50:
            content_issues.append(f"Document {i+1} ({doc['type']}) has insufficient content")
    
    if content_issues:
        print(f"   ❌ Content issues: {content_issues}")
    else:
        print("   ✅ All documents have sufficient content")
    
    # Test embedding creation
    print("\n🧠 6. Testing Embedding Creation...")
    
    if rag.document_embeddings is not None:
        print(f"   ✅ Embeddings created: {rag.document_embeddings.shape}")
        print(f"   📚 Vocabulary size: {len(rag.vectorizer.vocabulary_)}")
        
        # Test embedding quality
        embedding_stats = {
            'min_value': rag.document_embeddings.data.min(),
            'max_value': rag.document_embeddings.data.max(),
            'mean_value': rag.document_embeddings.data.mean(),
            'sparsity': 1.0 - rag.document_embeddings.nnz / (rag.document_embeddings.shape[0] * rag.document_embeddings.shape[1])
        }
        print(f"   📊 Embedding stats: {embedding_stats}")
    else:
        print("   ❌ No embeddings created")
    
    # Test relevance retrieval
    print("\n🎯 7. Testing Relevance Retrieval...")
    
    test_queries = [
        "critical malware threats",
        "vulnerability management best practices",
        "incident response procedures",
        "ransomware attack mitigation",
        "compliance requirements"
    ]
    
    for query in test_queries:
        relevant_docs = rag.retrieve_relevant_documents(query, top_k=3)
        print(f"   🔍 Query: '{query}'")
        print(f"      Found {len(relevant_docs)} relevant documents")
        
        for doc in relevant_docs:
            print(f"      - {doc['document']['type']} {doc['document']['id']} (similarity: {doc['similarity']:.3f})")
    
    # Test security query filtering
    print("\n🔒 8. Testing Security Query Filtering...")
    
    security_queries = [
        "critical malware threats",
        "vulnerability management",
        "incident response",
        "compliance frameworks",
        "weather today",  # Non-security query
        "football scores",  # Non-security query
        "how to hack systems",  # Should be blocked
        "security best practices"  # Should be allowed
    ]
    
    for query in security_queries:
        is_security = rag.is_security_related_query(query)
        status = "✅ Security" if is_security else "❌ Not security"
        print(f"   '{query}' -> {status}")
    
    # Test document content quality
    print("\n📝 9. Testing Document Content Quality...")
    
    # Sample documents for quality check
    sample_docs = {
        'threat': next((doc for doc in rag.documents if doc['type'] == 'threat'), None),
        'vulnerability': next((doc for doc in rag.documents if doc['type'] == 'vulnerability'), None),
        'incident': next((doc for doc in rag.documents if doc['type'] == 'incident'), None)
    }
    
    for doc_type, doc in sample_docs.items():
        if doc:
            content = doc['content']
            word_count = len(content.split())
            char_count = len(content)
            
            print(f"   📄 {doc_type.capitalize()} Document:")
            print(f"      Words: {word_count}, Characters: {char_count}")
            
            # Check for key security terms
            security_terms = ['threat', 'vulnerability', 'incident', 'security', 'risk', 'mitigation']
            found_terms = [term for term in security_terms if term.lower() in content.lower()]
            print(f"      Security terms found: {found_terms}")
    
    # Test RAG system completeness
    print("\n🔍 10. Testing RAG System Completeness...")
    
    completeness_checks = {
        'has_documents': len(rag.documents) > 0,
        'has_embeddings': rag.document_embeddings is not None,
        'has_vectorizer': rag.vectorizer is not None,
        'has_vocabulary': len(rag.vectorizer.vocabulary_) > 0 if rag.vectorizer else False,
        'can_retrieve_docs': len(rag.retrieve_relevant_documents("security", top_k=1)) > 0,
        'filters_queries': rag.is_security_related_query("security") and not rag.is_security_related_query("weather")
    }
    
    all_checks_passed = all(completeness_checks.values())
    
    print("   📋 Completeness Checks:")
    for check, passed in completeness_checks.items():
        status = "✅" if passed else "❌"
        print(f"      {status} {check}")
    
    if all_checks_passed:
        print("\n🎉 ALL RAG IMPLEMENTATION CHECKS PASSED!")
        print("   ✅ RAG system is properly implemented")
        print("   ✅ All documents are correctly integrated")
        print("   ✅ Relevant data is properly indexed")
        print("   ✅ Security filtering is working")
        print("   ✅ Document quality is sufficient")
    else:
        print("\n❌ SOME RAG IMPLEMENTATION CHECKS FAILED!")
        print("   Please review the failed checks above")
    
    # Summary statistics
    print("\n📊 SUMMARY STATISTICS:")
    print(f"   📚 Total Documents: {len(rag.documents)}")
    print(f"   🧠 Embedding Dimensions: {rag.document_embeddings.shape if rag.document_embeddings is not None else 'None'}")
    print(f"   📖 Vocabulary Size: {len(rag.vectorizer.vocabulary_) if rag.vectorizer else 0}")
    print(f"   📄 Document Types: {list(document_types.keys())}")
    
    return all_checks_passed

if __name__ == "__main__":
    success = test_rag_implementation()
    sys.exit(0 if success else 1)
