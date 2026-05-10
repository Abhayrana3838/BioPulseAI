import pickle
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

def test_tpoc_model():
    """Test the TPOT model pickle file"""
    
    print("=== Testing TPOT Model ===")
    
    # Load the test data
    try:
        df = pd.read_csv("/Users/abhaysinghrana/Desktop/internship project/predictive_maintenance_dataset (1).csv")
        print("✅ Dataset loaded successfully")
        print(f"Dataset shape: {df.shape}")
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        return
    
    # Prepare test data (same preprocessing as in notebook)
    feature_cols = ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3']
    X = df[feature_cols]
    y = df['label']
    
    # Split data (same as notebook)
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Test set shape: {X_test.shape}")
    print(f"Test set failure rate: {y_test.mean()*100:.2f}%")
    
    # Load the model
    try:
        with open('tpot_best_model.pkl', 'rb') as f:
            model = pickle.load(f)
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return
    
    # Test model predictions
    try:
        print("\n=== Model Information ===")
        print(f"Model type: {type(model)}")
        if hasattr(model, 'steps'):
            print("Pipeline steps:")
            for name, step in model.steps:
                print(f"  {name}: {type(step).__name__}")
        
        print("\n=== Making Predictions ===")
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
        
        print("✅ Predictions completed successfully")
        
        # Evaluate performance
        print("\n=== Model Performance ===")
        print("Classification Report:")
        print(classification_report(y_test, y_pred))
        
        print(f"Accuracy: {(y_pred == y_test).mean():.4f}")
        
        if y_proba is not None:
            print(f"AUC-ROC: {roc_auc_score(y_test, y_proba):.4f}")
            print(f"Average predicted probability: {y_proba.mean():.4f}")
        
        # Show some sample predictions
        print("\n=== Sample Predictions ===")
        sample_indices = np.random.choice(len(X_test), 5, replace=False)
        for i in sample_indices:
            features = X_test.iloc[i].values
            actual = y_test.iloc[i]
            predicted = y_pred[i]
            proba = y_proba[i] if y_proba is not None else "N/A"
            
            print(f"Sample {i+1}:")
            print(f"  Features: {features}")
            print(f"  Actual: {actual}")
            print(f"  Predicted: {predicted}")
            print(f"  Probability: {proba}")
            print(f"  Correct: {'✅' if actual == predicted else '❌'}")
            print()
        
        # Test with custom data
        print("=== Testing with Custom Data ===")
        custom_data = pd.DataFrame({
            'vibration': [1.398, 0.822, 0.756],
            'acoustic': [0.834, 0.645, 0.523],
            'temperature': [76.20, 66.85, 64.04],
            'current': [15.08, 13.04, 11.75],
            'IMF_1': [0.345, 0.196, 0.141],
            'IMF_2': [0.132, 0.033, 0.022],
            'IMF_3': [0.001, 0.000, 0.029]
        })
        
        custom_pred = model.predict(custom_data)
        custom_proba = model.predict_proba(custom_data)[:, 1] if hasattr(model, 'predict_proba') else None
        
        for i in range(len(custom_data)):
            print(f"Custom Sample {i+1}:")
            print(f"  Input: {custom_data.iloc[i].to_dict()}")
            print(f"  Prediction: {custom_pred[i]}")
            if custom_proba is not None:
                print(f"  Failure Probability: {custom_proba[i]:.4f}")
            print()
        
        print("✅ Model testing completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_tpoc_model()
