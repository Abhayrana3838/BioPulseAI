import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from tpot import TPOTClassifier

def retrain_and_save_model():
    """Retrain TPOT model and save it properly"""
    
    print("=== Retraining TPOT Model ===")
    
    # Load and prepare data
    df = pd.read_csv("/Users/abhaysinghrana/Desktop/internship project/predictive_maintenance_dataset (1).csv")
    
    feature_cols = ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3']
    X = df[feature_cols]
    y = df['label']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {X_train.shape}")
    print(f"Test set: {X_test.shape}")
    print(f"Failure rate: {y.mean()*100:.2f}%")
    
    # Train TPOT model (shorter time for testing)
    print("\n=== Training TPOT Model ===")
    tpot = TPOTClassifier(
        generations=10,  # Reduced for faster training
        population_size=20,
        scoring='f1',
        cv=3,  # Reduced for faster training
        random_state=42,
        n_jobs=1,
        max_time_mins=2,  # Shorter time for testing
        max_eval_time_mins=1,
        verbosity=1
    )
    
    tpot.fit(X_train, y_train)
    print("✅ TPOT training completed")
    
    # Evaluate model
    print("\n=== Model Evaluation ===")
    y_pred = tpot.predict(X_test)
    y_proba = tpot.predict_proba(X_test)[:, 1]
    
    from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
    
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"AUC-ROC: {roc_auc_score(y_test, y_proba):.4f}")
    
    # Save model properly
    print("\n=== Saving Model ===")
    try:
        with open('tpot_best_model.pkl', 'wb') as f:
            pickle.dump(tpot.fitted_pipeline_, f)
        print("✅ Model saved successfully as 'tpot_best_model.pkl'")
    except Exception as e:
        print(f"❌ Error saving model: {e}")
        return False
    
    # Test loading the model
    print("\n=== Testing Model Loading ===")
    try:
        with open('tpot_best_model.pkl', 'rb') as f:
            loaded_model = pickle.load(f)
        print("✅ Model loaded successfully")
        
        # Test predictions
        test_pred = loaded_model.predict(X_test[:5])
        test_proba = loaded_model.predict_proba(X_test[:5])[:, 1]
        
        print("Sample predictions:")
        for i in range(5):
            print(f"  Sample {i+1}: Actual={y_test.iloc[i]}, Predicted={test_pred[i]}, Prob={test_proba[i]:.4f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

if __name__ == "__main__":
    success = retrain_and_save_model()
    if success:
        print("\n✅ Model retraining and testing completed successfully!")
    else:
        print("\n❌ Model retraining failed!")
