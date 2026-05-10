import pickle
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

def test_realistic_model():
    """Test the realistic model pickle file"""
    
    print("=== Testing Realistic Model ===")
    
    # Load the test data
    try:
        df = pd.read_csv("/Users/abhaysinghrana/Desktop/internship project/predictive_maintenance_dataset (1).csv")
        print("✅ Dataset loaded successfully")
        print(f"Dataset shape: {df.shape}")
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        return
    
    # Prepare test data (same preprocessing as in realistic model)
    feature_cols = ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3']
    X = df[feature_cols].copy()
    y = df['label'].copy()
    
    # Add the same noise and random features as in training
    np.random.seed(123)
    noise_level = 0.5
    for col in feature_cols:
        X[col] = X[col] + np.random.normal(0, noise_level * X[col].std(), len(X))
    
    # Add random features
    X['random_noise_1'] = np.random.normal(0, 1, len(X))
    X['random_noise_2'] = np.random.normal(0, 1, len(X))
    
    # Update feature list
    feature_cols = X.columns.tolist()
    
    # Add mislabels
    mislabel_rate = 0.10
    n_mislabels = int(len(y) * mislabel_rate)
    mislabel_indices = np.random.choice(len(y), n_mislabels, replace=False)
    y.iloc[mislabel_indices] = 1 - y.iloc[mislabel_indices]
    
    # Split data
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Test set shape: {X_test.shape}")
    print(f"Test set failure rate: {y_test.mean()*100:.2f}%")
    
    # Load the realistic model
    try:
        with open('realistic_maintenance_model_v3.pkl', 'rb') as f:
            model = pickle.load(f)
        print("✅ Realistic model loaded successfully")
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
        
        accuracy = (y_pred == y_test).mean()
        print(f"Accuracy: {accuracy:.4f}")
        
        if y_proba is not None:
            print(f"AUC-ROC: {roc_auc_score(y_test, y_proba):.4f}")
            print(f"Average predicted probability: {y_proba.mean():.4f}")
        
        # Performance assessment
        print(f"\n=== Performance Assessment ===")
        if 0.88 <= accuracy <= 0.92:
            print("✅ Excellent! Accuracy is in the ideal realistic range (88-92%)")
        elif 0.85 <= accuracy <= 0.95:
            print("✅ Good! Accuracy is in an acceptable realistic range (85-95%)")
        elif accuracy > 0.95:
            print("⚠️  Accuracy too high - model may be overfitting")
        else:
            print("ℹ️  Accuracy is more realistic, though on the lower side")
        
        # Show some sample predictions
        print("\n=== Sample Predictions ===")
        sample_indices = np.random.choice(len(X_test), 5, replace=False)
        for i in sample_indices:
            features = X_test.iloc[i].values
            actual = y_test.iloc[i]
            predicted = y_pred[i]
            proba = y_proba[i] if y_proba is not None else "N/A"
            
            print(f"Sample {i+1}:")
            print(f"  Actual: {actual}")
            print(f"  Predicted: {predicted}")
            print(f"  Probability: {proba}")
            print(f"  Correct: {'✅' if actual == predicted else '❌'}")
            print()
        
        # Test with custom data
        print("=== Testing with Custom Data ===")
        custom_data = pd.DataFrame({
            'vibration': [1.398, 0.822, 0.756, 1.1, 0.9],
            'acoustic': [0.834, 0.645, 0.523, 0.75, 0.65],
            'temperature': [76.20, 66.85, 64.04, 68.0, 67.0],
            'current': [15.08, 13.04, 11.75, 13.5, 12.5],
            'IMF_1': [0.345, 0.196, 0.141, 0.2, 0.17],
            'IMF_2': [0.132, 0.033, 0.022, 0.03, 0.025],
            'IMF_3': [0.001, 0.000, 0.029, 0.003, 0.002],
            'random_noise_1': [0.1, -0.2, 0.3, 0.0, -0.1],
            'random_noise_2': [-0.1, 0.5, 0.1, -0.3, 0.2]
        })
        
        custom_pred = model.predict(custom_data)
        custom_proba = model.predict_proba(custom_data)[:, 1] if hasattr(model, 'predict_proba') else None
        
        scenarios = ['High Risk', 'Normal', 'Low Risk', 'Moderate Risk', 'Normal-Low']
        for i in range(len(custom_data)):
            print(f"{scenarios[i]} Scenario:")
            print(f"  Prediction: {custom_pred[i]}")
            if custom_proba is not None:
                print(f"  Failure Probability: {custom_proba[i]:.3f}")
            print()
        
        print("✅ Realistic model testing completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_realistic_model()
