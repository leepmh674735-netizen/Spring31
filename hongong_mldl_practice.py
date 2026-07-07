import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier

def run_ch2_knn(length, weight):
    """
    Ch 2. 도미(Bream)와 빙어(Smelt) 분류 (K-Nearest Neighbors)
    """
    # 도미 데이터 (길이, 무게)
    bream_length = [25.4, 26.3, 26.5, 29.0, 29.0, 29.7, 29.7, 30.0, 30.0, 30.7, 31.0, 31.0, 31.5, 32.0, 32.0, 32.0, 33.0, 33.0, 33.5, 33.5, 34.0, 34.0, 34.5, 35.0, 35.0, 35.0, 35.0, 36.0, 36.0, 37.0, 38.5, 38.5, 39.5, 41.0, 41.0]
    bream_weight = [242.0, 290.0, 340.0, 363.0, 430.0, 450.0, 500.0, 390.0, 450.0, 500.0, 475.0, 500.0, 500.0, 340.0, 600.0, 600.0, 700.0, 700.0, 610.0, 650.0, 575.0, 685.0, 620.0, 680.0, 700.0, 725.0, 720.0, 714.0, 850.0, 1000.0, 920.0, 955.0, 925.0, 975.0, 950.0]

    # 빙어 데이터 (길이, 무게)
    smelt_length = [9.8, 10.5, 10.6, 11.0, 11.2, 11.3, 11.8, 11.8, 12.0, 12.2, 12.4, 13.0, 14.3, 15.0]
    smelt_weight = [6.7, 7.5, 7.0, 9.7, 9.8, 8.7, 10.0, 9.9, 9.8, 12.2, 13.4, 12.2, 19.7, 19.9]

    # 데이터 병합
    fish_length = bream_length + smelt_length
    fish_weight = bream_weight + smelt_weight
    fish_data = [[l, w] for l, w in zip(fish_length, fish_weight)]
    
    # 타겟 데이터 (1: 도미, 0: 빙어)
    fish_target = [1]*35 + [0]*14

    # 모델 학습
    kn = KNeighborsClassifier()
    kn.fit(fish_data, fish_target)

    # 새로운 샘플 예측
    prediction = kn.predict([[length, weight]])
    proba = kn.predict_proba([[length, weight]])
    
    print(f"\n[KNN 분류 결과] 입력: 길이 {length}cm, 무게 {weight}g")
    if prediction[0] == 1:
        print(f"-> 결과: 도미 (Bream) 🐟 (확률: {proba[0][1]*100}%)")
    else:
        print(f"-> 결과: 빙어 (Smelt) 🐟 (확률: {proba[0][0]*100}%)")

def run_ch3_regression(length):
    """
    Ch 3. 농어(Perch) 무게 예측 (Linear & Polynomial Regression)
    """
    # 농어 데이터 (길이 -> 무게)
    perch_length = np.array([8.4, 13.7, 15.0, 16.2, 17.4, 18.0, 18.7, 19.0, 19.6, 20.0, 21.0, 21.0, 21.0, 21.3, 22.0, 22.0, 22.0, 22.0, 22.0, 22.5, 22.5, 22.7, 23.0, 23.5, 24.0, 24.0, 24.6, 25.0, 25.6, 26.5, 27.3, 27.5, 27.5, 27.5, 28.0, 28.7, 30.0, 32.8, 34.5, 35.0, 36.5, 37.0, 37.0, 39.0, 39.0, 39.0, 40.0, 40.0, 40.0, 40.0, 42.0, 43.0, 43.0, 43.5, 44.0])
    perch_weight = np.array([5.9, 32.0, 40.0, 51.5, 70.0, 100.0, 78.0, 80.0, 85.0, 85.0, 110.0, 115.0, 125.0, 130.0, 120.0, 120.0, 130.0, 135.0, 110.0, 130.0, 150.0, 145.0, 150.0, 170.0, 225.0, 145.0, 188.0, 180.0, 197.0, 218.0, 300.0, 260.0, 265.0, 250.0, 250.0, 300.0, 320.0, 514.0, 556.0, 840.0, 685.0, 700.0, 700.0, 690.0, 900.0, 650.0, 820.0, 850.0, 900.0, 1015.0, 820.0, 1100.0, 1000.0, 1100.0, 1000.0])

    # 다항 회귀 피처 준비 (길이^2, 길이)
    train_poly = np.column_stack((perch_length ** 2, perch_length))
    
    # 모델 학습
    lr = LinearRegression()
    lr.fit(train_poly, perch_weight)

    # 예측 대상 길이 피처 변환
    pred_poly = [[length ** 2, length]]
    weight_pred = lr.predict(pred_poly)

    print(f"\n[다항 회귀 예측 결과] 입력: 농어 길이 {length}cm")
    print(f"-> 예측 무게: {weight_pred[0]:.2f}g")

def run_ch5_wine(alcohol, sugar, ph):
    """
    Ch 5. 와인 분류 (Decision Tree)
    """
    # 가상 와인 데이터셋 생성 (레드: 0, 화이트: 1)
    np.random.seed(42)
    n_samples = 200
    
    # 화이트 와인 (도수가 높고 당도가 높음)
    white_alc = np.random.normal(11.5, 0.8, n_samples // 2)
    white_sug = np.random.normal(7.5, 2.0, n_samples // 2)
    white_ph = np.random.normal(3.2, 0.15, n_samples // 2)
    
    # 레드 와인
    red_alc = np.random.normal(10.2, 0.6, n_samples // 2)
    red_sug = np.random.normal(2.2, 0.8, n_samples // 2)
    red_ph = np.random.normal(3.4, 0.1, n_samples // 2)

    alcohols = np.concatenate([white_alc, red_alc])
    sugars = np.concatenate([white_sug, red_sug])
    phs = np.concatenate([white_ph, red_ph])
    targets = np.concatenate([np.ones(n_samples // 2), np.zeros(n_samples // 2)]) # 1: 화이트, 0: 레드

    X = np.column_stack((alcohols, sugars, phs))
    
    # 모델 학습
    dt = DecisionTreeClassifier(max_depth=3, random_state=42)
    dt.fit(X, targets)

    # 예측
    pred = dt.predict([[alcohol, sugar, ph]])
    proba = dt.predict_proba([[alcohol, sugar, ph]])

    print(f"\n[결정 트리 분류 결과] 입력: 알코올 {alcohol}%, 당도 {sugar}, pH {ph}")
    if pred[0] == 1:
        print(f"-> 결과: 화이트 와인 (White Wine) 🥂 (확률: {proba[0][1]*100:.1f}%)")
    else:
        print(f"-> 결과: 레드 와인 (Red Wine) 🍷 (확률: {proba[0][0]*100:.1f}%)")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        chapter = sys.argv[1]
        if chapter == "knn" and len(sys.argv) >= 4:
            run_ch2_knn(float(sys.argv[2]), float(sys.argv[3]))
        elif chapter == "reg" and len(sys.argv) >= 3:
            run_ch3_regression(float(sys.argv[2]))
        elif chapter == "wine" and len(sys.argv) >= 5:
            run_ch5_wine(float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]))
        else:
            print("사용법: python hongong_mldl_practice.py [knn/reg/wine] [파라미터들...]")
    else:
        print("기본 테스트 실행:")
        run_ch2_knn(30.0, 600.0)
        run_ch3_regression(50.0)
        run_ch5_wine(11.0, 6.0, 3.2)
