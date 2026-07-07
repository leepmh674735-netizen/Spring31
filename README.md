# 🏋️‍♂️ Gym Customer Churn Prediction System & Multi-Curriculum Hub

이 프로젝트는 **자바 스프링 부트(Spring Boot) 백엔드**, **리액트(React) 프런트엔드**, 그리고 **AI 모델(RandomForest -> ONNX)**을 통합한 회원 관리 및 이탈 분석 대시보드 시스템입니다. 

총 5가지의 핵심 기술 서적 및 실습 모듈이 통합적으로 구성되어 있으며, 각 파트별 소스코드와 관련 문서의 깃허브 링크는 아래에서 개별적으로 쉽게 확인하실 수 있습니다.

---

## 🗂️ 핵심 모듈별 바로가기 (GitHub Links)

### 1. 🏋️‍♂️ AI 고객 이탈 예측 & 대시보드 시스템 (Spring Boot + React)
* **[스프링 부트 API 컨트롤러 (Java)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/src/main/java/me/shinsunyoung/springbootdeveloper/controller/ChurnApiController.java): 이탈 여부를 예측하여 JSON 값을 전달해 주는 REST API 컨트롤러입니다.
* **[스프링 부트 예측 서비스 (Java)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/src/main/java/me/shinsunyoung/springbootdeveloper/service/ChurnPredictionService.java): ONNX Runtime 엔진을 임베딩하여 랜덤포레스트 모델 예측을 실행하는 자바 서비스 로직입니다.
* **[Vite 리액트 대시보드 소스 (React)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/frontend/src/App.jsx): 전체 UI와 실시간 KNN 산점도, 회귀선 차트, 생성 AI 시뮬레이션 및 곰돌이 마스코트 애니메이션이 함축된 핵심 프런트 소스코드입니다.
* **[대시보드 애니메이션 스타일시트 (CSS)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/frontend/src/index.css): Outfit/Fredoka One 폰트 바인딩 및 둥실 둥둥 플로팅 애니메이션 등의 시각 효과가 적용된 디자인 파일입니다.
* **[기계학습 모델 학습 코드 (Python)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/train_model.py): 랜덤포레스트 모델을 훈련시키고 자바가 읽을 수 있도록 `.onnx` 포맷으로 변환해 주는 파이썬 코드입니다.
* **[이탈 예측 모델 바이너리 (ONNX)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/src/main/resources/models/gym_churn_model.onnx): 학습 완료되어 백엔드 리소스에 수납된 최종 기계학습 모델입니다.

### 2. 🛢️ 오라클 SQL 헬스장 데이터베이스 설계
* **[오라클 DB 테이블 설계 스크립트 (SQL)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/oracle_gym_db.sql): 오라클 특화 제약조건, 가입/출석/결제 스키마 및 PL/SQL 통계 분석 프로시저가 작성된 스크립트입니다.

### 3. 🐍 파이썬 일잘러 자동화 23선 실습실
* **[일잘러 자동화 종합 파이썬 코드 (Python)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/automation_tools.py): 엑셀 병합, 웹 크롤링, 메일 자동 발송, PDF 병합 등 23가지 직장인 자동화 스크립트의 소스코드 모음입니다.

### 4. 📚 혼자 공부하는 머신러닝+딥러닝 실습관
* **[혼공 ML/DL 단독 파이썬 소스코드 (Python)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/hongong_mldl_practice.py): KNN 도미/빙어 분류, 농어 다항 회귀식, 와인 디시전트리 학습을 로컬에서 단독으로 수행할 수 있는 연습 스크립트입니다.

### 5. ⚛️ 성낙현의 리액트 프로그래밍 16선 실습관
* **[16선 리액트 통합 컴포넌트 코드 (React)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/frontend/src/App.jsx#L427-L661): state/props, useEffect 타이머, useMemo 최적화, Custom Hook 및 useReducer 은행 금고 등 16개 핵심 코드와 주석이 바인딩된 영역입니다.

### 6. 🤖 만들면서 배우는 생성 AI 실습관
* **[생성 AI 4대 모듈 파이썬 소스코드 (Python)]**(https://github.com/leepmh674735-netizen/Spring31/blob/main/generative_ai_practice.py): OpenAI GPT API, DALL-E 3 이미지 생성, RAG 코사인 유사도 벡터 연산 및 툴 호출(Function Calling) 에이전트를 실행할 수 있는 단독 파이썬 스크립트입니다.

---

## 🚀 로컬 컴퓨터 구동 순서

1. **기계학습 모델 생성**:
   ```powershell
   python train_model.py
   ```
2. **자바 스프링 부트 구동**:
   ```powershell
   $env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"
   ./gradlew bootRun
   ```
3. **리액트 웹 페이지 구동**:
   ```powershell
   cd frontend
   npm run dev -- --host
   ```
   이후 브라우저에서 `http://localhost:5173`으로 접속해 조작합니다.
