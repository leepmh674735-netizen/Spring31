import os
import numpy as np

# 가상 OpenAI API 호출 시뮬레이션 및 실제 API 구조 수록
def run_gpt_chat(prompt, system_instruction="너는 친절한 헬스장 챗봇 비서곰이다곰."):
    """
    Ch 1. OpenAI GPT Chat Completion API 호출 예시
    """
    print(f"\n[OpenAI GPT 호출]")
    print(f"System: {system_instruction}")
    print(f"User Prompt: '{prompt}'")
    
    # 실제 구현 시:
    # from openai import OpenAI
    # client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    # response = client.chat.completions.create(
    #     model="gpt-4o",
    #     messages=[
    #         {"role": "system", "content": system_instruction},
    #         {"role": "user", "content": prompt}
    #     ]
    # )
    # return response.choices[0].message.content
    
    # 시뮬레이션 응답 반환
    print("-> AI Response: 안녕하곰! 요청하신 마케팅 문구는 다음과 같다곰: '오늘부터 운동하고 근육곰이랑 득근해보자곰! 💪'")

def run_dalle_image(prompt):
    """
    Ch 2. DALL-E 3 이미지 생성 API 호출 예시
    """
    print(f"\n[DALL-E 3 이미지 생성]")
    print(f"Prompt: '{prompt}'")
    
    # 실제 구현 시:
    # response = client.images.generate(
    #     model="dall-e-3",
    #     prompt=prompt,
    #     n=1,
    #     size="1024x1024"
    # )
    # image_url = response.data[0].url
    print("-> Image URL: https://images.openai.com/mock-generated-image.png")

def run_rag_search(query):
    """
    Ch 3. RAG (Retrieval-Augmented Generation) 임베딩 유사도 검색
    """
    # 체육관 규정 매뉴얼 데이터베이스 청크
    manual_chunks = [
        "규정 1: 회원권 만료 전 7일 이내에 재등록 시 10% 얼리버드 할인이 적용됩니다.",
        "규정 2: 운동복 및 락커룸 이용 금액은 월 11,000원이며 회원권과 별도로 결제해야 합니다.",
        "규정 3: 하루 최대 입장 제한은 없으며 1일 2회 이상 자유롭게 출석 체크가 가능합니다."
      ]
    
    print(f"\n[RAG 유사도 매칭]")
    print(f"질의어: '{query}'")
    
    # 실제 구현 시: OpenAI Embedding API를 통해 벡터 변환 후 코사인 유사도 연산
    # 여기서는 키워드 코사인 매칭을 모사한 유사도 출력
    scores = []
    for chunk in manual_chunks:
        # 단어 매칭 개수로 간단히 유사도 점수 모사
        match_count = sum(1 for word in query.split() if word in chunk)
        sim_score = 0.1 + (match_count * 0.4)
        scores.append(min(0.98, sim_score))
        
    best_idx = int(np.argmax(scores))
    print(f"-> 검색된 최적 컨텍스트: {manual_chunks[best_idx]} (유사도: {scores[best_idx]*100:.1f}%)")
    print(f"-> 최종 프롬프트: [Context] {manual_chunks[best_idx]} \\n[Question] {query}")

def run_function_calling():
    """
    Ch 4. AI 에이전트 도구 사용 (Function Calling / Tool Use)
    """
    print("\n[Function Calling 에이전트 구동]")
    
    # 도구 사양 선언
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_member_status",
                "description": "특정 회원의 출석일 및 락커 이용 여부를 DB에서 가져옵니다.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "회원 이름"}
                    },
                    "required": ["name"]
                }
            }
        }
    ]
    
    print("1. 에이전트 질문 접수: '강철수 회원의 이용 현황 알려줘'")
    print("2. LLM 판단: get_member_status(name='강철수') 함수 호출 필요 결정")
    print("3. 로컬 DB 쿼리 실행: 강철수 (출석 2회, 락커 사용 중)")
    print("4. LLM 최종 요약: '강철수 회원님은 현재 락커를 사용 중이며 이번 달 출석은 총 2회입니다곰! 🐻'")

if __name__ == "__main__":
    run_gpt_chat("이탈률 높은 회원에게 보낼 감사 할인 프로모션 문자 초안 작성해줘.")
    run_rag_search("회원권 재등록하면 할인 혜택이 어떻게 되나요?")
    run_function_calling()
