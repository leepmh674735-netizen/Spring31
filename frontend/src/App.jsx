import React, { useState, useEffect, useRef, useReducer, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Tabs, Tab, ProgressBar, Spinner } from 'react-bootstrap';
import { Line, Doughnut, Scatter, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Initial Mock Gym Members Database
const INITIAL_MEMBERS = [
  { id: 1, name: '강철수', age: 28, gender: '남성', recency: 25, frequencyMonthly: 2, frequencyWeekly: 0, visitDropRate: -0.8, contractPeriod: 3, isLockerUsed: 1, isClothesUsed: 0 },
  { id: 2, name: '김태희', age: 32, gender: '여성', recency: 2, frequencyMonthly: 22, frequencyWeekly: 5, visitDropRate: 0.1, contractPeriod: 12, isLockerUsed: 1, isClothesUsed: 1 },
  { id: 3, name: '이민호', age: 24, gender: '남성', recency: 11, frequencyMonthly: 8, frequencyWeekly: 1, visitDropRate: -0.4, contractPeriod: 1, isLockerUsed: 0, isClothesUsed: 0 },
  { id: 4, name: '박민영', age: 39, gender: '여성', recency: 18, frequencyMonthly: 4, frequencyWeekly: 1, visitDropRate: -0.6, contractPeriod: 3, isLockerUsed: 1, isClothesUsed: 0 },
  { id: 5, name: '최강근', age: 45, gender: '남성', recency: 0, frequencyMonthly: 26, frequencyWeekly: 6, visitDropRate: 0.2, contractPeriod: 6, isLockerUsed: 1, isClothesUsed: 1 },
  { id: 6, name: '정수지', age: 30, gender: '여성', recency: 29, frequencyMonthly: 0, frequencyWeekly: 0, visitDropRate: -1.0, contractPeriod: 1, isLockerUsed: 0, isClothesUsed: 0 }
];

// 8x8 Pixel Art Maps for Fashion MNIST neural network simulation
const APPAREL_MAPS = {
  tshirt: [
    0,1,1,1,1,1,1,0,
    1,1,1,1,1,1,1,1,
    1,0,1,1,1,1,0,1,
    0,0,1,1,1,1,0,0,
    0,0,1,1,1,1,0,0,
    0,0,1,1,1,1,0,0,
    0,0,1,1,1,1,0,0,
    0,0,1,1,1,1,0,0
  ],
  sneaker: [
    0,0,0,0,0,1,1,0,
    0,0,0,0,1,1,1,0,
    0,0,1,1,1,1,1,0,
    0,1,1,1,1,1,1,0,
    1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0
  ],
  trouser: [
    0,1,1,1,1,1,1,0,
    0,1,1,0,0,1,1,0,
    0,1,1,0,0,1,1,0,
    0,1,1,0,0,1,1,0,
    0,1,1,0,0,1,1,0,
    0,1,1,0,0,1,1,0,
    0,1,1,0,0,1,1,0,
    0,1,1,0,0,1,1,0
  ],
  bag: [
    0,0,0,1,1,0,0,0,
    0,0,1,0,0,1,0,0,
    0,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,0,
    0,0,0,0,0,0,0,0
  ]
};

// All 23 Office Automation Programs Database
const AUTOMATION_PROGRAMS = [
  {
    id: 1,
    category: 'excel',
    categoryName: '📊 엑셀 및 데이터',
    title: '1. 여러 엑셀 파일 병합',
    description: '여러 부서나 지점에서 생성한 개별 엑셀 파일을 하나로 통합 병합합니다.',
    command: 'python merge_excel.py',
    code: `import os
import pandas as pd

def merge_excel_files(input_dir, output_file):
    all_dfs = []
    for file in os.listdir(input_dir):
        if file.endswith('.xlsx'):
            path = os.path.join(input_dir, file)
            df = pd.read_excel(path)
            all_dfs.append(df)
    merged_df = pd.concat(all_dfs, ignore_index=True)
    merged_df.to_excel(output_file, index=False)
    print("성공: 모든 파일이 병합되었습니다!")`,
    logs: [
      '[INFO] 데이터 수집 디렉토리 스캔 개시...',
      '[INFO] 병합 대상 엑셀 파일 3개 탐지 (seoul, busan, daegu)',
      '[INFO] Pandas DataFrame 로드 및 정렬 처리...',
      '[SUCCESS] 총 450행 데이터 병합 완료. merged_report.xlsx 파일 저장 성공.'
    ]
  },
  {
    id: 2,
    category: 'excel',
    categoryName: '📊 엑셀 및 데이터',
    title: '2. 조건부 셀 스타일 강조',
    description: '이탈 확률이나 연체 금액이 특정 한도를 초과할 때 빨간색 배경을 자동 칠해줍니다.',
    command: 'python highlight_cells.py',
    code: `from openpyxl import load_workbook
from openpyxl.styles import PatternFill, Font

def highlight_cells(file_path, target_col, threshold):
    wb = load_workbook(file_path)
    ws = wb.active
    red_fill = PatternFill(start_color="FEE2E2", fill_type="solid")
    red_font = Font(color="991B1B", bold=True)
    for row in range(2, ws.max_row + 1):
        cell = ws.cell(row=row, column=target_col)
        if cell.value and float(cell.value) >= threshold:
            cell.fill = red_fill
            cell.font = red_font
    wb.save(file_path)
    print("성공: 조건부 스타일 서식이 지정되었습니다.")`,
    logs: [
      '[INFO] 파일 로딩: member_sheet.xlsx',
      '[INFO] openpyxl 시트 폰트 및 셀 탐색 가동...',
      '[INFO] 임계값 초과 셀 발견: 12개 행 (위험 회원 라인)',
      '[SUCCESS] 조건 충족 셀 스타일 지정 완료 (#FEE2E2 채우기 적용).'
    ]
  },
  {
    id: 3,
    category: 'excel',
    categoryName: '📊 엑셀 및 데이터',
    title: '3. 엑셀 차트 자동 생성',
    description: '수집한 원본 숫자를 엑셀 내 꺾은선이나 막대 그래프로 자동 드로잉하여 내보냅니다.',
    command: 'python create_chart.py',
    code: `from openpyxl import load_workbook
from openpyxl.chart import BarChart, Reference

def create_excel_chart(file_path):
    wb = load_workbook(file_path)
    ws = wb.active
    chart = BarChart()
    chart.title = "월별 매출 현황"
    data = Reference(ws, min_col=2, min_row=1, max_row=ws.max_row)
    cats = Reference(ws, min_col=1, min_row=2, max_row=ws.max_row)
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    ws.add_chart(chart, "E2")
    wb.save(file_path)
    print("성공: 바 차트가 엑셀 시트에 삽입되었습니다!")`,
    logs: [
      '[INFO] 엑셀 워크북 리딩...',
      '[INFO] 매출 집계 통계 영역 Reference 탐색 완료.',
      '[INFO] 2D BarChart 오브젝트 생성 및 좌표 (E2) 바인딩.',
      '[SUCCESS] 차트 레이아웃 구성 및 저장 완료.'
    ]
  },
  {
    id: 4,
    category: 'excel',
    categoryName: '📊 엑셀 및 데이터',
    title: '4. CSV 데이터 피벗 요약',
    description: '수십만 행의 원시 CSV 정보로부터 항목별 합계와 평균을 구하는 피벗을 엑셀화합니다.',
    command: 'python pivot_summary.py',
    code: `import pandas as pd

def generate_pivot(csv_path, index_col, values_col):
    df = pd.read_csv(csv_path)
    pivot = df.pivot_table(index=index_col, values=values_col, aggfunc=['sum', 'mean'])
    pivot.to_excel("pivot_summary.xlsx")
    print("성공: 피벗 테이블 요약 보고서 저장 완료!")`,
    logs: [
      '[INFO] 대용량 CSV 파일 스트리밍 로드 시작...',
      '[INFO] Pandas 인메모리 피벗 그룹 연산 기동...',
      '[INFO] 인덱스 기준: 회원유형별, 값 기준: 매출총액 합계/평균 도출.',
      '[SUCCESS] 요약 피벗 보고서 pivot_summary.xlsx 저장 완료.'
    ]
  },
  {
    id: 5,
    category: 'excel',
    categoryName: '📊 엑셀 및 데이터',
    title: '5. 조건별 시트 분할 저장',
    description: '여러 카테고리가 모인 하나의 엑셀 시트를 카테고리별 개별 엑셀 문서로 쪼갭니다.',
    command: 'python split_sheet.py',
    code: `import pandas as pd

def split_sheet_by_column(file_path, split_col_name, output_dir):
    df = pd.read_excel(file_path)
    unique_vals = df[split_col_name].unique()
    for val in unique_vals:
        sub_df = df[df[split_col_name] == val]
        sub_df.to_excel(f"{output_dir}/{val}_report.xlsx", index=False)
    print("성공: 모든 시트 분할 분리가 완료되었습니다.")`,
    logs: [
      '[INFO] 마스터 엑셀 시트 분석...',
      '[INFO] 분할 키 열: [지점명] 기준 유니크 값 4개 탐지 (강남, 마포, 서초, 송파)',
      '[INFO] 분할 루프 작동 및 개별 필터링 데이터셋 분리...',
      '[SUCCESS] 강남_report.xlsx 외 3개 시트 독립 파일 분할 저장 완료.'
    ]
  },

  // Category 2: File (6~10)
  {
    id: 6,
    category: 'file',
    categoryName: '📂 파일 및 폴더 관리',
    title: '6. 파일 이름 일괄 변경',
    description: '난잡하게 섞인 스크린샷이나 계약서 문서에 접두사(날짜 등)를 일괄 붙여줍니다.',
    command: 'python rename_files.py',
    code: `import os

def bulk_rename(directory, prefix):
    for filename in os.listdir(directory):
        old_path = os.path.join(directory, filename)
        new_name = f"{prefix}_{filename}"
        new_path = os.path.join(directory, new_name)
        os.rename(old_path, new_path)
    print("성공: 파일명 변경 작업이 끝났습니다.")`,
    logs: [
      '[INFO] 타겟 디렉토리 내 파일 목록 집계...',
      '[INFO] 이미지 및 문서 파일 42개 탐지.',
      '[INFO] 파일명 교체 루프 가동: [2026-07-07_파일명] 형태로 전환.',
      '[SUCCESS] 총 42개 파일의 이름 교체 완료.'
    ]
  },
  {
    id: 7,
    category: 'file',
    categoryName: '📂 파일 및 폴더 관리',
    title: '7. 확장자별 파일 분류',
    description: '다운로드 폴더 내 파일들을 확장자(.pdf, .xlsx, .zip)별 폴더를 생성하여 자동 수납합니다.',
    command: 'python organize_files.py',
    code: `import os
import shutil

def organize_files(directory):
    for filename in os.listdir(directory):
        path = os.path.join(directory, filename)
        if os.path.isfile(path):
            ext = filename.split('.')[-1].lower()
            target_dir = os.path.join(directory, ext)
            os.makedirs(target_dir, exist_ok=True)
            shutil.move(path, os.path.join(target_dir, filename))
    print("성공: 폴더가 말끔히 정리되었습니다.")`,
    logs: [
      '[INFO] 정리 대상 폴더 탐색...',
      '[INFO] 발견된 확장자 유형: pdf (12개), xlsx (8개), zip (4개)',
      '[INFO] 각 확장자별 하위 수납 서브 폴더 동적 생성...',
      '[SUCCESS] 총 24개 파일을 해당 유형별 폴더로 이동 조치 완료.'
    ]
  },
  {
    id: 8,
    category: 'file',
    categoryName: '📂 파일 및 폴더 관리',
    title: '8. 중복 파일 자동 삭제',
    description: '이름이 달라도 내용물 파일 해시값(MD5)이 동일한 스크랩 파일을 식별하여 삭제합니다.',
    command: 'python delete_duplicates.py',
    code: `import os
import hashlib

def delete_duplicates(directory):
    hashes = {}
    for root, _, files in os.walk(directory):
        for file in files:
            path = os.path.join(root, file)
            hasher = hashlib.md5()
            with open(path, 'rb') as f:
                hasher.update(f.read())
            file_hash = hasher.hexdigest()
            if file_hash in hashes:
                os.remove(path)
            else:
                hashes[file_hash] = path
    print("성공: 중복 파일 정리가 끝났습니다.")`,
    logs: [
      '[INFO]  하위 탐색 트리 생성...',
      '[INFO] 각 파일 이진 해싱 MD5 연산 수행 중...',
      '[INFO] 중복 해시 매칭 감지: 4개 중복 파일 포착.',
      '[SUCCESS] 중복 복사본 파일 4건 영구 삭제 조치.'
    ]
  },
  {
    id: 9,
    category: 'file',
    categoryName: '📂 파일 및 폴더 관리',
    title: '9. 폴더별 ZIP 일괄 압축',
    description: '서로 다른 업무 하위 폴더들을 각각 개별 압축 파일로 신속하게 패키징합니다.',
    command: 'python bulk_zip.py',
    code: `import os
import zipfile

def bulk_zip(directory):
    for item in os.listdir(directory):
        path = os.path.join(directory, item)
        if os.path.isdir(path):
            zip_name = f"{path}.zip"
            with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, _, files in os.walk(path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path, os.path.relpath(file_path, directory))
    print("성공: 모든 하위 폴더 압축 성공!")`,
    logs: [
      '[INFO] 디렉토리 구조 스캔...',
      '[INFO] 서브 디렉토리 3개 포착 (Report_Q1, Report_Q2, Photos)',
      '[INFO] zipfile 인플레이트 개별 스트림 압축 가동...',
      '[SUCCESS] Report_Q1.zip, Report_Q2.zip, Photos.zip 빌드 완료.'
    ]
  },
  {
    id: 10,
    category: 'file',
    categoryName: '📂 파일 및 폴더 관리',
    title: '10. 폴더 실시간 감시 백업',
    description: '감시 중인 폴더에 파일이 드롭되는 순간 감지하여 백업 장치 폴더로 복제합니다.',
    command: 'python watch_folder.py',
    code: `import os
import time
import shutil

def watch_and_backup(source_dir, backup_dir):
    before = dict([(f, None) for f in os.listdir(source_dir)])
    while True:
        time.sleep(2)
        after = dict([(f, None) for f in os.listdir(source_dir)])
        added = [f for f in after if not f in before]
        for f in added:
            shutil.copy(os.path.join(source_dir, f), os.path.join(backup_dir, f))
        before = after`,
    logs: [
      '[INFO] 실시간 모니터 스레드 가동...',
      '[INFO] 소스 감시지: C:/Gym/CheckInLogs',
      '[ALERT] 신규 로그 파일 감지: checkin_20260707.txt',
      '[SUCCESS] 백업 저장소로 자동 파일 안전 복사 실행 완료.'
    ]
  },

  // Category 3: Crawl (11~15)
  {
    id: 11,
    category: 'crawl',
    categoryName: '🌐 웹 크롤링 및 수집',
    title: '11. 네이버 뉴스 키워드 크롤링',
    description: '뉴스 제목 및 링크를 긁어 엑셀로 저장합니다.',
    command: 'python scrape_news.py',
    code: `import requests
from bs4 import BeautifulSoup
import pandas as pd

def scrape_news(query):
    url = f"https://search.naver.com/search.naver?where=news&query={query}"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, 'html.parser')
    news_list = []
    for item in soup.select('.news_tit'):
        news_list.append({'title': item.text, 'link': item['href']})
    df = pd.DataFrame(news_list)
    df.to_excel(f"{query}_news.xlsx", index=False)
    print("성공: 크롤링 뉴스 저장 완료!")`,
    logs: [
      '[INFO] HTTP GET 요청 전송: naver.com 뉴스 검색 결과...',
      '[INFO] BeautifulSoup 구문 분석기 가동...',
      '[INFO] 뉴스 헤드라인 엘리먼트 15개 적재 성공.',
      '[SUCCESS] 데이터 수집 및 헬스장_트렌드_news.xlsx 저장 완료.'
    ]
  },
  {
    id: 12,
    category: 'crawl',
    categoryName: '🌐 웹 크롤링 및 수집',
    title: '12. 쇼핑몰 최저가 모니터링',
    description: '경쟁사 금액이나 보충제 최저가를 스크랩하여 보고합니다.',
    command: 'python monitor_prices.py',
    code: `import requests
from bs4 import BeautifulSoup

def get_product_price(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    price = soup.select_one('.product_price').text
    return price`,
    logs: [
      '[INFO] 보충제 쇼핑몰 모니터링 세션 시작...',
      '[INFO] User-Agent 브라우저 세션 모방 패킷 송신...',
      '[INFO] 타겟 셀렉터 [.product_price] 매칭 성공.',
      '[SUCCESS] 현재 최저가 파악: 42,900원 (변동 없음).'
    ]
  },
  {
    id: 13,
    category: 'crawl',
    categoryName: '🌐 웹 크롤링 및 수집',
    title: '13. 웹 이미지 일괄 다운로더',
    description: '지정한 주소에 링크된 사진 파일을 한꺼번에 다운로드합니다.',
    command: 'python download_images.py',
    code: `import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def download_images(url, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    soup = BeautifulSoup(requests.get(url).text, 'html.parser')
    for img in soup.select('img'):
        img_url = urljoin(url, img.get('src', ''))
        try:
            name = img_url.split('/')[-1].split('?')[0]
            with open(os.path.join(output_dir, name), 'wb') as f:
                f.write(requests.get(img_url).content)
        except: continue`,
    logs: [
      '[INFO] 타겟 갤러리 파싱...',
      '[INFO] HTML 내부 이미지 [img] 태그 소스 경로 18개 탐색.',
      '[INFO] 바이너리 스트림 다운로드 개시...',
      '[SUCCESS] 총 18개 마케팅용 고품질 사진 저장 완료.'
    ]
  },
  {
    id: 14,
    category: 'crawl',
    categoryName: '🌐 웹 크롤링 및 수집',
    title: '14. 블로그 검색 순위 추적',
    description: '체육관 홍보 블로그 글이 검색 통합 뷰에서 몇 위에 노출되는지 체크합니다.',
    command: 'python track_blog.py',
    code: `import requests
from bs4 import BeautifulSoup

def get_blog_rank(query, my_blog_url):
    url = f"https://search.naver.com/search.naver?where=blog&query={query}"
    soup = BeautifulSoup(requests.get(url).text, 'html.parser')
    for rank, item in enumerate(soup.select('.api_txt_lines.total_tit'), 1):
        if my_blog_url in item['href']:
            return rank
    return -1`,
    logs: [
      '[INFO] 키워드: [강남역 헬스장 추천] 검색 조회...',
      '[INFO] 검색 랭킹 상위 블로그 30개 링크 수집...',
      '[INFO] 매칭 확인 중: smartgym_blog...',
      '[SUCCESS] 매칭 확인 완료: 검색 결과 상위 4위에 노출 중입니다!'
    ]
  },
  {
    id: 15,
    category: 'crawl',
    categoryName: '🌐 웹 크롤링 및 수집',
    title: '15. 실시간 주식 시세 요약',
    description: '관심 금융 종목코드들의 현재 주가를 수집하여 엑셀 시트에 바인딩합니다.',
    command: 'python get_stocks.py',
    code: `import requests
from bs4 import BeautifulSoup
import pandas as pd

def get_stock_prices(codes):
    data = []
    for code in codes:
        url = f"https://finance.naver.com/item/main.naver?code={code}"
        soup = BeautifulSoup(requests.get(url).text, 'html.parser')
        price = soup.select_one('.no_today .blind').text
        data.append({'Code': code, 'Price': price})
    pd.DataFrame(data).to_excel("stocks.xlsx", index=False)
    print("성공: 주가 집계 완료.")`,
    logs: [
      '[INFO] 금융 포털 주가 조회 엔진 시동...',
      '[INFO] 종목 코드 조회 중: 005930(삼성전자), 035720(카카오)...',
      '[INFO] 실시간 체결가 파싱 완료.',
      '[SUCCESS] 수집 결과 취합 후 stocks.xlsx 내보내기 성공.'
    ]
  },

  // Category 4: Msg (16~19)
  {
    id: 16,
    category: 'msg',
    categoryName: '✉️ 메일 및 메시지 발송',
    title: '16. 첨부파일 이메일 전송',
    description: '자동화 엑셀 리포트 파일을 이메일에 첨부하여 수신자에게 전송합니다.',
    command: 'python send_email.py',
    code: `import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os

def send_attachment_email(smtp_server, port, sender, password, receiver, file_path):
    msg = MIMEMultipart()
    msg['Subject'] = "Smart Gym 일일 자동화 보고서"
    msg.attach(MIMEText("보고서를 첨부합니다.", 'plain'))
    with open(file_path, "rb") as attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f"attachment; filename= {os.path.basename(file_path)}")
        msg.attach(part)
    server = smtplib.SMTP(smtp_server, port)
    server.starttls()
    server.login(sender, password)
    server.sendmail(sender, receiver, msg.as_string())
    server.quit()`,
    logs: [
      '[INFO] SMTP 클라이언트 접속 준비...',
      '[INFO] 전송 계정 보안 인증 로그인 절차 통과...',
      '[INFO] gym_member_report.xlsx 바이너리 변환 및 패킹 첨부 완료.',
      '[SUCCESS] 메일 전송 성공 (상태 코드: 250 Mail accepted).'
    ]
  },
  {
    id: 17,
    category: 'msg',
    categoryName: '✉️ 메일 및 메시지 발송',
    title: '17. 개인화 대량 메일 발송',
    description: '엑셀 명단의 회원명, 이메일 주소를 매핑하여 안내 알림 메일을 대량 발송합니다.',
    command: 'python send_bulk_emails.py',
    code: `import pandas as pd
import smtplib
from email.mime.text import MIMEText

def send_bulk_personalized_mails(excel_path, sender, password):
    df = pd.read_excel(excel_path)
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(sender, password)
    for _, row in df.iterrows():
        body = f"안녕하세요 {row['Name']}님! 회원권 만료가 {row['ExpireDays']}일 남았습니다."
        msg = MIMEText(body)
        msg['Subject'] = f"[Smart Gym] {row['Name']}님 만료 예정 안내"
        server.sendmail(sender, row['Email'], msg.as_string())
    server.quit()`,
    logs: [
      '[INFO] 개인화 이메일 명단 로딩...',
      '[INFO] 수신 대상: 총 3명 (김헬스, 이근육, 박유산소)',
      '[INFO] 개별 이메일 메시지 동적 빌드 및 전송 루프 가동...',
      '[SUCCESS] 3명의 회원 대상 맞춤 경고 메일 발송 성공.'
    ]
  },
  {
    id: 18,
    category: 'msg',
    categoryName: '✉️ 메일 및 메시지 발송',
    title: '18. 슬랙(Slack) 업무 자동 브리핑',
    description: '매일 아침 출석률 및 이탈 위험군 통계를 슬랙 채널에 웹훅 카드로 전송합니다.',
    command: 'python slack_notifier.py',
    code: `import requests
import json

def post_slack_message(webhook_url, text):
    payload = {"text": text}
    requests.post(webhook_url, data=json.dumps(payload), headers={'Content-Type': 'application/json'})
    print("슬랙 브리핑 성공")`,
    logs: [
      '[INFO] 대시보드 통계 요약 적재...',
      '[INFO] 슬랙 웹훅 URL 헤더 설정 및 JSON 페이로드 구조화...',
      '[SUCCESS] 슬랙 채널 [#gym-alerts] 메시지 발송 완료 (200 OK).'
    ]
  },
  {
    id: 19,
    category: 'msg',
    categoryName: '✉️ 메일 및 메시지 발송',
    title: '19. 텔레그램 긴급 알림 봇',
    description: '예측 결과 극단적 고위험 회원이 감지될 시 즉각 텔레그램 봇으로 긴급 알림을 보냅니다.',
    command: 'python telegram_alert.py',
    code: `import requests

def send_telegram_alert(token, chat_id, message):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}
    requests.post(url, json=payload)
    print("텔레그램 알림 성공")`,
    logs: [
      '[INFO] 긴급 이탈 경고 스레드 연동...',
      '[ALERT] Churn Risk 91% 회원 발견 (정수지 회원)',
      '[INFO] 텔레그램 API 봇 통신 요청 송신...',
      '[SUCCESS] 관리자 텔레그램 메시지 푸시 알림 전송 완료.'
    ]
  },

  // Category 5: Doc (20~23)
  {
    id: 20,
    category: 'doc',
    categoryName: '📄 문서 및 이미지 자동화',
    title: '20. 여러 PDF 하나로 합치기',
    description: '쪼개진 회원 가이드 매뉴얼이나 계약서 PDF 파일들을 순서대로 하나의 파일로 결합합니다.',
    command: 'python merge_pdf.py',
    code: `from PyPDF2 import PdfMerger

def merge_pdfs(pdf_list, output_path):
    merger = PdfMerger()
    for pdf in pdf_list:
        merger.append(pdf)
    merger.write(output_path)
    merger.close()
    print("성공: PDF 병합 완료!")`,
    logs: [
      '[INFO] PDF 파일 리스트 확인...',
      '[INFO] 타겟 파일: contract_part1.pdf, contract_part2.pdf',
      '[INFO] PyPDF2 바이너리 병합 엔진 가동...',
      '[SUCCESS] 병합 성공: merged_member_agreement.pdf 저장 완료.'
    ]
  },
  {
    id: 21,
    category: 'doc',
    categoryName: '📄 문서 및 이미지 자동화',
    title: '21. 이미지에서 글자 추출 OCR',
    description: '영수증 사진이나 계약서 이미지 속의 텍스트를 OCR 인공지능으로 텍스트화합니다.',
    command: 'python run_ocr.py',
    code: `import pytesseract
from PIL import Image

def extract_text_from_image(image_path, output_txt):
    text = pytesseract.image_to_string(Image.open(image_path), lang='kor+eng')
    with open(output_txt, 'w', encoding='utf-8') as f:
        f.write(text)
    print("성공: OCR 텍스트 추출 완료!")`,
    logs: [
      '[INFO] pytesseract 패키지 가동...',
      '[INFO] 로드 이미지: receipt_scan.jpg (한글+영어 언어 팩 로딩)',
      '[INFO] 픽셀 라인 분석 및 텍스트 맵 생성 중...',
      '[SUCCESS] 글자 추출 성공: receipt_text.txt 쓰기 완료.'
    ]
  },
  {
    id: 22,
    category: 'doc',
    categoryName: '📄 문서 및 이미지 자동화',
    title: '22. 계약서 워드 파일 자동 생성',
    description: '고객 등록 정보를 워드 템플릿(docx) 내부의 키워드에 매핑하여 자동으로 일괄 작성해 줍니다.',
    command: 'python fill_doc.py',
    code: `from docx import Document

def fill_contract_template(template_path, data, output_path):
    doc = Document(template_path)
    for paragraph in doc.paragraphs:
        for key, value in data.items():
            if key in paragraph.text:
                paragraph.text = paragraph.text.replace(key, str(value))
    doc.save(output_path)
    print("성공: 계약서 출력 성공!")`,
    logs: [
      '[INFO] docx 워드 서식 템플릿 파일 오픈...',
      '[INFO] 키 매핑: {{Name}} -> 강철수, {{JoinDate}} -> 2026-07-07',
      '[INFO] 문단 내 텍스트 정밀 교체 프로세싱...',
      '[SUCCESS] 가입 계약서 파일 강철수_agreement.docx 생성 완료.'
    ]
  },
  {
    id: 23,
    category: 'doc',
    categoryName: '📄 문서 및 이미지 자동화',
    title: '23. 이미지 일괄 워터마크 변환',
    description: '마케팅용 사진들의 해상도를 변환하고 우측 하단에 체육관 로고를 워터마크로 삽입합니다.',
    command: 'python watermark.py',
    code: `from PIL import Image
import os

def watermark_and_resize(input_dir, output_dir, logo_path):
    logo = Image.open(logo_path).convert("RGBA")
    os.makedirs(output_dir, exist_ok=True)
    for file in os.listdir(input_dir):
        if file.endswith(('.png', '.jpg')):
            img = Image.open(os.path.join(input_dir, file)).convert("RGBA")
            img = img.resize((1280, 720))
            pos = (img.width - logo.width - 20, img.height - logo.height - 20)
            img.paste(logo, pos, logo)
            img.convert("RGB").save(os.path.join(output_dir, file), "JPEG")`,
    logs: [
      '[INFO] PIL 이미지 컨버터 기동...',
      '[INFO] 로고 소스 파일 오픈 및 알파 블렌딩 리사이징 적용 중...',
      '[SUCCESS] 이미지 일괄 삽입 완료. output/ 경로에 JPEG 파일로 저장.'
    ]
  }
];

// HonGong ML/DL Chapter Data
const HONGONG_CURRICULUMS = [
  {
    id: 'knn',
    title: '🐟 Ch 2. 도미와 빙어 분류 (KNN)',
    description: 'K-최근접 이웃(KNN) 알고리즘으로 길이와 무게에 따라 도미(Bream)와 빙어(Smelt)를 정밀 분류합니다.',
    theory: '가장 가까운 K개의 이웃 데이터 포인트를 비교하여 다수결로 분류를 결정하는 기초적인 인스턴스 기반 학습 모델입니다.',
    pythonCode: `from sklearn.neighbors import KNeighborsClassifier

fish_data = [[25.4, 242.0], [26.3, 290.0], ..., [9.8, 6.7]]
fish_target = [1]*35 + [0]*14

kn = KNeighborsClassifier()
kn.fit(fish_data, fish_target)
print(kn.predict([[30.0, 600.0]]))`
  },
  {
    id: 'regression',
    title: '🐟 Ch 3. 농어 무게 예측 (선형 회귀)',
    description: '농어(Perch)의 길이 치수를 바탕으로 2차 다항 회귀(Polynomial Regression)식을 활용해 무게를 정교하게 예측합니다.',
    theory: '입력 특성을 제곱한 항(길이^2)을 추가하여 직선이 아닌 곡선 형태의 최적 모델을 도출하는 다항 회귀식 기법입니다.',
    pythonCode: `import numpy as np
from sklearn.linear_model import LinearRegression

perch_length = np.array([8.4, 13.7, ...])
perch_weight = np.array([5.9, 32.0, ...])

train_poly = np.column_stack((perch_length ** 2, perch_length))
lr = LinearRegression()
lr.fit(train_poly, perch_weight)`
  },
  {
    id: 'wine',
    title: '🍷 Ch 5. 와인 분류 (결정 트리)',
    description: '알코올 도수, 당도, pH 산도 데이터를 조건 질문들로 트리 형태로 분기하여 레드와 화이트 와인을 감별합니다.',
    theory: '스무고개와 유사한 구조로 데이터를 분기하며, 피처 중요도를 연산하여 설명력(Explainability)이 가장 우수한 트리 예측 모델입니다.',
    pythonCode: `from sklearn.tree import DecisionTreeClassifier

dt = DecisionTreeClassifier(max_depth=3, random_state=42)
dt.fit(X, y)
print("특성 중요도:", dt.feature_importances_)`
  },
  {
    id: 'nn',
    title: '🧥 Ch 7. 패션 MNIST 의류 분류 (인공 신경망)',
    description: '텐서플로/케라스 딥러닝을 통해 10종의 의류 종류(티셔츠, 슈즈, 가방 등) 이미지를 예측 분류합니다.',
    theory: '입력층, 은닉층(Dense), 출력층(Softmax)으로 이루어진 다층 퍼셉트론(MLP) 인공 신경망 모델을 활용해 2D 픽셀을 분류합니다.',
    pythonCode: `import tensorflow as tf
from tensorflow import keras

model = keras.Sequential([
    keras.layers.Dense(100, activation='sigmoid', input_shape=(784,)),
    keras.layers.Dense(10, activation='softmax')
])`
  }
];

// Seong Nak-Hyeon React 16 Projects Curriculum Database
const NAKHYEON_PROJECTS = [
  {
    id: 1,
    title: '1. Hello React (JSX 문법)',
    description: 'JSX 문법의 원리와 변수 바인딩 동작 방식을 학습합니다.',
    code: `import React from 'react';
function Hello(props) {
  return <h1>안녕하세요, {props.name}님!</h1>;
}`,
    theory: 'JSX는 자바스크립트의 확장 문법으로, XML/HTML 형식의 코드를 브라우저가 해석하기 용역하도록 React.createElement API로 변환해 줍니다.'
  },
  {
    id: 2,
    title: '2. props와 state (컴포넌트)',
    description: '외부 프로퍼티 props와 컴포넌트 내부 동적 상태 state를 다룹니다.',
    code: `import React, { useState } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
    theory: 'props는 상위 컴포넌트가 하위 컴포넌트에게 단방향으로 주입하는 읽기 전용 정보이며, state는 컴포넌트 자신이 내부에서 생성하여 조작하는 가변 상태값입니다.'
  },
  {
    id: 3,
    title: '3. Event Handling (이벤트 처리)',
    description: '리액트의 합성 이벤트(SyntheticEvent) 처리 메커니즘을 배웁니다.',
    code: `function Tracker() {
  const handleClick = (e) => {
    console.log("클릭 좌표:", e.clientX, e.clientY);
  };
  return <div onClick={handleClick}>클릭해 보곰!</div>;
}`,
    theory: 'React는 W3C 표준 규격에 부합하도록 브라우저 고유의 원시 이벤트를 래핑한 합성 이벤트 객체를 핸들러에 전달하여 크로스 브라우징을 지원합니다.'
  },
  {
    id: 4,
    title: '4. Lifecycle & useEffect (생명주기)',
    description: '클래스 컴포넌트의 생명주기를 훅의 useEffect로 대체 결합하는 실습입니다.',
    code: `useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  return () => clearInterval(timer);
}, []);`,
    theory: 'useEffect의 첫 번째 매개변수로 콜백을 넣고 두 번째 의존성 배열을 비워둘 경우, 마운트 시점에만 리스너를 바인딩하고 언마운트 시 클린업을 수행합니다.'
  },
  {
    id: 5,
    title: '5. 조건부 렌더링 (Condition)',
    description: '로그인 여부 등 특정한 boolean 플래그 조건에 따라 UI를 분기합니다.',
    code: `{isLoggedIn ? <WelcomeBanner /> : <LoginForm \/>}`,
    theory: '자바스크립트 인라인 삼항 연산자나 단축 평가 논리 연산자(&&)를 통해 상태 조건에 맞춰 동적으로 DOM 트리를 렌더링할 수 있습니다.'
  },
  {
    id: 6,
    title: '6. List & Key (리스트 렌더링)',
    description: '배열 데이터를 map 함수로 풀어서 동적 리스트 뷰를 빌드합니다.',
    code: `<ul>
  {items.map(item => (
    <li key={item.id}>{item.text}</li>
  ))}
</ul>`,
    theory: '리액트 가상 DOM 디피 알고리즘(Diffing Algorithm)이 어떤 노드가 추가/교체되었는지 식별할 수 있도록 배열 루프 내 고유한 key props를 반드시 전달해야 합니다.'
  },
  {
    id: 7,
    title: '7. Controlled Form (제어 컴포넌트)',
    description: '입력 폼 요소의 밸류를 리액트 state에 실시간 양방향 바인딩합니다.',
    code: `<input value={name} onChange={e => setName(e.target.value)} />`,
    theory: 'HTML의 원래 폼 제어 방식을 따르지 않고, 입력값 변화를 리액트 상태 관리 체계로 가로채 단일 진실 공급원(Single Source of Truth)으로 일치시킵니다.'
  },
  {
    id: 8,
    title: '8. Shared State (상태 공유)',
    description: '형제 컴포넌트들끼리 동일한 수치 정보를 동기화하는 상태 승격 실습입니다.',
    code: `// 부모에서 관리
const [temperature, setTemperature] = useState('');`,
    theory: '동일한 변경 원천 데이터를 공유해야 하는 형제 노드가 있다면, 상태(State)를 이들의 가장 가까운 공통 조상 컴포넌트로 리프팅하여 통합 조율합니다.'
  },
  {
    id: 9,
    title: '9. Composition (합성 패턴)',
    description: '상속 대신 컴포넌트 중첩 자식 엘리먼트 children을 전달받아 조립합니다.',
    code: `function Card(props) {
  return <div className="border">{props.children}</div>;
}`,
    theory: '리액트에서는 컴포넌트를 확장하기 위한 클래스 상속(Inheritance)보다는, 구성 요소들을 둥글게 감싸 포함하는 합성(Composition) 패턴을 적극 장려합니다.'
  },
  {
    id: 10,
    title: '10. Context API (전역 상태)',
    description: '프로퍼티 드릴링 없이 테마 정보 등의 전역 값을 하위 트리에 배포합니다.',
    code: `const ThemeContext = React.createContext('dark');`,
    theory: '트리 레벨이 깊은 컴포넌트 간 데이터를 패스할 때 유용하며, 로그인한 유저 세션이나 스타일 테마 스위처 등에 표준 전역 스토어로 활용됩니다.'
  },
  {
    id: 11,
    title: '11. useRef (DOM 제어)',
    description: '리액트 가상 노드가 아닌 실제 브라우저의 DOM 노드 객체에 직접 포커스를 주입합니다.',
    code: `const inputRef = useRef(null);
const focusInput = () => inputRef.current.focus();`,
    theory: 'useRef는 컴포넌트가 재렌더링되어도 값을 계속 유지하는 참조 저장소 역할을 하며, 렌더링 트리 유발 없이 값만 보관하거나 수동 DOM 제어에 씁니다.'
  },
  {
    id: 12,
    title: '12. useMemo & useCallback',
    description: '연산 효율 개선을 위해 값이나 함수 선언을 메모이징 캐시 처리합니다.',
    code: `const memoizedVal = useMemo(() => calculate(a, b), [a, b]);`,
    theory: '불필요한 무거운 연산의 재실행을 방지하고 자식 컴포넌트에게 함수 props 전송 시 재생성을 억제하여 렌더링 사이클 성능 누수를 차단합니다.'
  },
  {
    id: 13,
    title: '13. Custom Hooks (사용자 정의 훅)',
    description: '반복되는 공통 상태 제어 로직을 컴팩트한 커스텀 훅 패키지로 모듈화합니다.',
    code: `function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth });
  return size;
}`,
    theory: '리액트 컴포넌트 내부에서 상태 로직을 공유하는 가장 세련된 방식이며, 훅 이름의 접두사는 무조건 use로 시작하는 표준 룰이 요구됩니다.'
  },
  {
    id: 14,
    title: '14. useReducer (복잡한 상태)',
    description: '이벤트의 Action 타입에 따라 상태 변경을 순수 함수 Reducer로 위임 분기합니다.',
    code: `const [state, dispatch] = useReducer(reducer, initialState);`,
    theory: '이전 상태와 액션 객체를 입력받아 새로운 불변 상태를 반환하는 리듀서 패턴을 통해 복잡하고 다차원적인 상태 변화 과정을 명확히 규정합니다.'
  },
  {
    id: 15,
    title: '15. Axios HTTP Call (API 연동)',
    description: '비동기 요청을 전달하여 원격 서버 정보를 적재하고 렌더링합니다.',
    code: `axios.get('/api/data').then(res => setData(res.data));`,
    theory: '컴포넌트 마운트 완료 직후(useEffect) API 호출 스레드를 백그라운드 구동하여 수신 대기 상태와 오류 처리를 결합 렌더링하는 표준 기법입니다.'
  },
  {
    id: 16,
    title: '16. React Router (가상 라우터)',
    description: '클라이언트 사이드 라우팅으로 새로고침 없는 가상 페이지 내비게이션을 수행합니다.',
    code: `const [path, setPath] = useState('home');`,
    theory: '브라우저 히스토리 API와 매핑하여 주소 표시줄 경로에 대응하는 가상 컴포넌트들을 DOM 조작을 통해 부분 교체하여 SPA 속도를 극대화합니다.'
  }
];

// Generative AI Chapters Curriculum Database
const GENAI_CHAPTERS = [
  {
    id: 'gpt',
    title: '🤖 Ch 1. OpenAI GPT 챗봇',
    description: 'GPT-4o API를 통해 입력 프롬프트에 대응하는 마케팅 제안 문구를 작성합니다.',
    code: `from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "너는 헬스장 마케팅 요원이다."},
        {"role": "user", "content": "이탈 예정 회원 할인 혜택 SMS 초안 작성해줘."}
    ]
)
print(response.choices[0].message.content)`,
    theory: '대형 언어 모델(LLM)에 특정 역할 페르소나(System Instruction)를 규정하고 사용자 요구사항을 지시하여 답변 품질을 통제하는 기법입니다.'
  },
  {
    id: 'dalle',
    title: '🎨 Ch 2. DALL-E 이미지 생성',
    description: 'DALL-E 3 이미지 모델을 사용하여 프롬프트 스펙에 대응하는 마케팅 배너 그림을 생성합니다.',
    code: `response = client.images.generate(
    model="dall-e-3",
    prompt="A cute baby bear wearing gym gloves, lifting weights, 3d rendering",
    n=1,
    size="1024x1024"
)
image_url = response.data[0].url`,
    theory: '텍스트 토큰을 다차원 벡터 공간의 잠재 공간(Latent Space) 정보로 인코딩한 후 확산 과정(Diffusion Process)을 통해 이미지 픽셀을 생성해 냅니다.'
  },
  {
    id: 'rag',
    title: '🔍 Ch 3. RAG 기반 문서 검색',
    description: '자체 사내 규칙 매뉴얼의 임베딩 유사도를 검색(Cosine Similarity)하여 최적 답변 컨텍스트를 LLM에 전달합니다.',
    code: `import numpy as np
# 코사인 유사도 연산
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))`,
    theory: '사전 데이터 학습 없이 외부 지식 데이터베이스에서 관련 문서를 벡터 유사도로 검색하여 LLM 프롬프트에 주입(Context Injection)함으로써 환각(Hallucination) 현상을 차단합니다.'
  },
  {
    id: 'agent',
    title: '⚙️ Ch 4. AI Agent 함수 호출',
    description: 'LLM이 사용자 질문을 해결하기 위해 내부 함수(DB 조회 등)를 호출(Function Calling)하여 동작 상태를 보고받습니다.',
    code: `tools = [{
    "type": "function",
    "function": {
        "name": "get_member_status",
        "description": "회원 정보를 조회합니다.",
        "parameters": { ... }
    }
}]`,
    theory: 'LLM이 단순한 텍스트 답변 수준을 넘어, 기선언된 외부 API 명세를 판단하여 적절한 도구 사용(Tool Use) 명령을 스스로 판단하고 조율하는 지능형 에이전트 구조입니다.'
  }
];

// Database of all source code files we created for the Code Gallery Tab
const GALLERY_CODES = {
  springboot_controller: {
    title: '☕ ChurnApiController.java (API 컨트롤러)',
    path: 'src/main/java/me/shinsunyoung/springbootdeveloper/controller/ChurnApiController.java',
    description: '리액트 대시보드의 예측 요청을 자바 환경에서 수신하여 이탈 상태 확률 및 가이드를 반환해 주는 컨트롤러입니다.',
    code: `package me.shinsunyoung.springbootdeveloper.controller;

import me.shinsunyoung.springbootdeveloper.service.ChurnPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/churn")
@CrossOrigin(origins = "*")
public class ChurnApiController {

    @Autowired
    private ChurnPredictionService churnPredictionService;

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predict(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        try {
            float recency = ((Number) requestData.getOrDefault("recency", 0)).floatValue();
            float frequencyMonthly = ((Number) requestData.getOrDefault("frequencyMonthly", 0)).floatValue();
            float frequencyWeekly = ((Number) requestData.getOrDefault("frequencyWeekly", 0)).floatValue();
            float visitDropRate = ((Number) requestData.getOrDefault("visitDropRate", 0)).floatValue();
            float contractPeriod = ((Number) requestData.getOrDefault("contractPeriod", 0)).floatValue();
            float age = ((Number) requestData.getOrDefault("age", 0)).floatValue();
            float isLockerUsed = ((Number) requestData.getOrDefault("isLockerUsed", 0)).floatValue();
            float isClothesUsed = ((Number) requestData.getOrDefault("isClothesUsed", 0)).floatValue();

            float[] features = new float[] {
                recency, frequencyMonthly, frequencyWeekly, visitDropRate, contractPeriod, age, isLockerUsed, isClothesUsed
            };

            double probability = churnPredictionService.predictChurnProbability(features);
            
            response.put("success", true);
            response.put("churnProbability", probability);
            
            String riskLevel;
            if (probability >= 0.7) {
                riskLevel = "CRITICAL (위험)";
            } else if (probability >= 0.4) {
                riskLevel = "WARNING (주의)";
            } else {
                riskLevel = "SAFE (안전)";
            }
            response.put("riskLevel", riskLevel);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}`
  },
  springboot_service: {
    title: '☕ ChurnPredictionService.java (ONNX 연동 서비스)',
    path: 'src/main/java/me/shinsunyoung/springbootdeveloper/service/ChurnPredictionService.java',
    description: 'Microsoft ONNX Runtime 라이브러리를 바인딩해 RandomForest 기계학습 모델의 다차원 배열 피처 연산을 수행해 줍니다.',
    code: `package me.shinsunyoung.springbootdeveloper.service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.InputStream;
import java.nio.FloatBuffer;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChurnPredictionService {

    private OrtEnvironment env;
    private OrtSession session;

    @PostConstruct
    public void init() {
        try {
            this.env = OrtEnvironment.getEnvironment();
            try (InputStream is = getClass().getResourceAsStream("/models/gym_churn_model.onnx")) {
                if (is == null) return;
                byte[] modelBytes = is.readAllBytes();
                this.session = env.createSession(modelBytes);
            }
        } catch (Exception e) {
            System.err.println("Failed to init ONNX: " + e.getMessage());
        }
    }

    public double predictChurnProbability(float[] features) {
        if (session == null) return mockPrediction(features);
        try {
            String inputName = session.getInputNames().iterator().next();
            long[] shape = new long[]{1, features.length};
            FloatBuffer buffer = FloatBuffer.wrap(features);
            
            try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, buffer, shape)) {
                Map<String, OnnxTensor> inputs = new HashMap<>();
                inputs.put(inputName, inputTensor);
                
                try (OrtSession.Result results = session.run(inputs)) {
                    var outputNames = session.getOutputNames();
                    if (outputNames.size() >= 2) {
                        String probOutputName = (String) outputNames.toArray()[1];
                        Object value = results.get(probOutputName).get().getValue();
                        if (value instanceof Map[]) {
                            Map<Long, Float> probabilities = ((Map<Long, Float>[]) value)[0];
                            return probabilities.get(1L);
                        }
                    }
                    return mockPrediction(features);
                }
            }
        } catch (Exception e) {
            return mockPrediction(features);
        }
    }

    private double mockPrediction(float[] features) {
        float recency = features[0];
        float freq = features[1];
        double prob = 0.1;
        if (recency > 15) prob += 0.4;
        if (freq < 5) prob += 0.3;
        return Math.min(0.95, Math.max(0.05, prob));
    }
}`
  },
  oracle_sql: {
    title: '🛢️ oracle_gym_db.sql (오라클 스키마 설계)',
    path: 'oracle_gym_db.sql',
    description: '오라클 데이터베이스에 가입/결제/출석 로그 테이블을 설계하고, PL/SQL 프로시저를 생성해 ML 투입 파라미터(미방문일, 주간/월간 출석수)를 취합하는 쿼리입니다.',
    code: `-- 2. MEMBER (회원) 테이블 생성
CREATE TABLE MEMBER (
    MEMBER_ID         NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    NAME              VARCHAR2(50) NOT NULL,
    GENDER            VARCHAR2(10) CONSTRAINT CK_MEMBER_GENDER CHECK (GENDER IN ('M', 'F')),
    JOIN_DATE         DATE DEFAULT SYSDATE NOT NULL,
    MEMBERSHIP_TYPE   VARCHAR2(20),
    IS_LOCKER_USED    NUMBER(1) DEFAULT 0 CHECK (IS_LOCKER_USED IN (0, 1)),
    IS_CLOTHES_USED   NUMBER(1) DEFAULT 0 CHECK (IS_CLOTHES_USED IN (0, 1)),
    STATUS            VARCHAR2(20) DEFAULT 'ACTIVE'
);

-- 7. PL/SQL 프로시저 생성: 회원별 이탈 예측용 특성값(Feature) 집계 추출
CREATE OR REPLACE PROCEDURE PR_GET_CHURN_FEATURES (
    P_MEMBER_ID IN NUMBER,
    O_RECENCY OUT NUMBER,
    O_FREQ_MONTHLY OUT NUMBER,
    O_FREQ_WEEKLY OUT NUMBER
) AS
    V_LAST_VISIT TIMESTAMP;
BEGIN
    SELECT MAX(CHECK_IN_TIME) INTO V_LAST_VISIT FROM ATTENDANCE WHERE MEMBER_ID = P_MEMBER_ID;
    IF V_LAST_VISIT IS NULL THEN
        O_RECENCY := 999;
    ELSE
        O_RECENCY := ROUND(SYSDATE - CAST(V_LAST_VISIT AS DATE));
    END IF;

    SELECT COUNT(DISTINCT TRUNC(CHECK_IN_TIME)) INTO O_FREQ_MONTHLY FROM ATTENDANCE
    WHERE MEMBER_ID = P_MEMBER_ID AND CHECK_IN_TIME >= SYSTIMESTAMP - INTERVAL '30' DAY;

    SELECT COUNT(DISTINCT TRUNC(CHECK_IN_TIME)) INTO O_FREQ_WEEKLY FROM ATTENDANCE
    WHERE MEMBER_ID = P_MEMBER_ID AND CHECK_IN_TIME >= SYSTIMESTAMP - INTERVAL '7' DAY;
END;
/`
  },
  train_model: {
    title: '🧠 train_model.py (AI 이탈 예측 모델 학습)',
    path: 'train_model.py',
    description: '사이킷런(scikit-learn) 라이브러리를 통해 가상의 회원 행동 1,000건을 훈련시켜 랜덤포레스트 모델을 만들고, 이를 ONNX 파일로 빌드 저장합니다.',
    code: `import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from skl2onnx import to_onnx

np.random.seed(42)
n_samples = 1000
recency = np.random.randint(0, 30, n_samples)
frequency = np.random.randint(0, 30, n_samples)
contract = np.random.choice([1, 3, 6, 12], n_samples)
y = np.where((recency > 14) & (frequency < 8), 1, 0)
X = np.column_stack((recency, frequency, contract))

clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
clf.fit(X, y)

onnx_model = to_onnx(clf, X[:1].astype(np.float32))
with open("src/main/resources/models/gym_churn_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())
print("모델 생성 완료!")`
  },
  automation_tools: {
    title: '📊 automation_tools.py (파이썬 자동화 23선)',
    path: 'automation_tools.py',
    description: '엑셀 자동 서식 셀 병합, 폴더 ZIP 일괄 압축, 블로그 노출 분석, 텔레그램 경고 등 23가지 파이썬 업무 비서 코드들의 종합 스크립트 모음입니다.',
    code: `import os
import pandas as pd
import zipfile
import smtplib
from PyPDF2 import PdfMerger

# [프로그램 1. 엑셀 통합 병합]
def merge_excel_files(input_dir, output_file):
    all_dfs = [pd.read_excel(os.path.join(input_dir, f)) for f in os.listdir(input_dir) if f.endswith('.xlsx')]
    pd.concat(all_dfs, ignore_index=True).to_excel(output_file, index=False)

# [프로그램 9. 폴더별 ZIP 일괄 압축]
def bulk_zip(directory):
    for item in os.listdir(directory):
        path = os.path.join(directory, item)
        if os.path.isdir(path):
            with zipfile.ZipFile(f"{path}.zip", 'w', zipfile.ZIP_DEFLATED) as zipf:
                for r, _, files in os.walk(path):
                    for file in files:
                        zipf.write(os.path.join(r, file))

# [프로그램 20. 여러 PDF 결합]
def merge_pdfs(pdf_list, output_path):
    merger = PdfMerger()
    for pdf in pdf_list: merger.append(pdf)
    merger.write(output_path)
    merger.close()`
  },
  hongong_ml: {
    title: '📚 hongong_mldl_practice.py (혼공 ML/DL 실습)',
    path: 'hongong_mldl_practice.py',
    description: '생선 분류 KNN, 농어 무게 회귀, 와인 화이트/레드 감별 트리 모델을 각각 기동시키는 파이썬 단독 실습용 세션 파일입니다.',
    code: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LinearRegression

# 1. KNN Classification (생선)
fish_data = [[25.4, 242.0], [26.3, 290.0], [9.8, 6.7]]
fish_target = [1, 1, 0]
kn = KNeighborsClassifier(n_neighbors=1)
kn.fit(fish_data, fish_target)
print("KNN 생선 분류 결과:", kn.predict([[30.0, 600.0]]))

# 2. 다항 회귀 (농어 무게)
perch_length = np.array([8.4, 13.7, 15.0, 22.0])
perch_weight = np.array([5.9, 32.0, 40.0, 130.0])
train_poly = np.column_stack((perch_length ** 2, perch_length))
lr = LinearRegression()
lr.fit(train_poly, perch_weight)
print("회귀 예측 무게:", lr.predict([[25.0**2, 25.0]]))`
  },
  gen_ai: {
    title: '🤖 generative_ai_practice.py (생성형 AI 연습)',
    path: 'generative_ai_practice.py',
    description: 'GPT-4o 프롬프트 작성 지침, DALL-E 이미지 드로잉 바이너리, RAG 문서의 벡터 유사도 검색(Cosine) 연산을 포함한 파이썬 단독 실습 파일입니다.',
    code: `import numpy as np
from openai import OpenAI

# 1. RAG용 코사인 유사도 엔진
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 2. OpenAI API 연동 테스트
def run_gpt_demo():
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "너는 체육관 관리 비서이다."},
            {"role": "user", "content": "이탈 확률 80% 회원 케어 메세지 초안 작성해줘."}
        ]
    )
    print(response.choices[0].message.content)`
  }
};

// Initial mock datasets for KNN
const BREAM_POINTS = [
  { x: 25.4, y: 242.0 }, { x: 26.3, y: 290.0 }, { x: 26.5, y: 340.0 }, { x: 29.0, y: 363.0 },
  { x: 29.0, y: 430.0 }, { x: 29.7, y: 450.0 }, { x: 29.7, y: 500.0 }, { x: 30.0, y: 390.0 },
  { x: 30.0, y: 450.0 }, { x: 30.7, y: 500.0 }, { x: 31.0, y: 475.0 }, { x: 31.5, y: 500.0 },
  { x: 32.0, y: 600.0 }, { x: 33.0, y: 700.0 }, { x: 34.0, y: 685.0 }, { x: 35.0, y: 700.0 },
  { x: 36.0, y: 850.0 }, { x: 37.0, y: 1000.0 }, { x: 38.5, y: 955.0 }, { x: 41.0, y: 975.0 }
];
const SMELT_POINTS = [
  { x: 9.8, y: 6.7 }, { x: 10.5, y: 7.5 }, { x: 10.6, y: 7.0 }, { x: 11.0, y: 9.7 },
  { x: 11.2, y: 9.8 }, { x: 11.3, y: 8.7 }, { x: 11.8, y: 10.0 }, { x: 12.0, y: 9.8 },
  { x: 13.0, y: 12.2 }, { x: 14.3, y: 19.7 }, { x: 15.0, y: 19.9 }
];

const PERCH_POINTS = [
  { x: 8.4, y: 5.9 }, { x: 13.7, y: 32.0 }, { x: 15.0, y: 40.0 }, { x: 16.2, y: 51.5 },
  { x: 18.0, y: 100.0 }, { x: 20.0, y: 85.0 }, { x: 22.0, y: 130.0 }, { x: 24.0, y: 225.0 },
  { x: 26.5, y: 218.0 }, { x: 28.0, y: 250.0 }, { x: 30.0, y: 320.0 }, { x: 32.8, y: 514.0 },
  { x: 35.0, y: 840.0 }, { x: 37.0, y: 700.0 }, { x: 39.0, y: 900.0 }, { x: 40.0, y: 1015.0 },
  { x: 42.0, y: 820.0 }, { x: 43.5, y: 1100.0 }, { x: 44.0, y: 1000.0 }
];

const generatePerchCurve = () => {
  const curve = [];
  for (let x = 8; x <= 48; x += 2) {
    curve.push({ x: x, y: Math.max(0, 1.01 * x * x - 21.6 * x + 116.8) });
  }
  return curve;
};

// Python Churn Model Training script string
const PYTHON_TRAIN_CODE = `import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from skl2onnx import to_onnx

# 1. 가상 헬스장 출석 및 회원 특성 데이터 생성 (1,000명 분)
np.random.seed(42)
n_samples = 1000
recency = np.random.randint(0, 30, n_samples)
frequency = np.random.randint(0, 30, n_samples)
contract = np.random.choice([1, 3, 6, 12], n_samples)

# 미방문이 오래되고 출석이 낮을수록 이탈(1)하도록 이진 레이블링 마스킹
y = np.where((recency > 14) & (frequency < 8), 1, 0)
X = np.column_stack((recency, frequency, contract))

# 2. RandomForestClassifier 분류 모델 학습
clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
clf.fit(X, y)

# 3. 자바 스프링 부트에서 구동하기 위해 ONNX 포맷으로 변환 후 파일 저장
onnx_model = to_onnx(clf, X[:1].astype(np.float32))
with open("gym_churn_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())
print("모델 학습 및 ONNX 변환 완료!")`;

function App() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(INITIAL_MEMBERS[0]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // Tab navigation tracker
  const [currentTab, setCurrentTab] = useState('database');

  // Simulator State
  const [simRecency, setSimRecency] = useState(10);
  const [simFreqMonthly, setSimFreqMonthly] = useState(12);
  const [simFreqWeekly, setSimFreqWeekly] = useState(3);
  const [simDropRate, setSimDropRate] = useState(0.0);
  const [simContract, setSimContract] = useState(3);
  const [simAge, setSimAge] = useState(30);
  const [simLocker, setSimLocker] = useState(true);
  const [simClothes, setSimClothes] = useState(false);
  const [simPrediction, setSimPrediction] = useState(null);

  // Python Automation Tab State
  const [activeCategory, setActiveCategory] = useState('excel');
  const [selectedProgram, setSelectedProgram] = useState(AUTOMATION_PROGRAMS[0]);
  const [terminalLines, setTerminalLines] = useState(['$ Ready to run automation scripts...']);
  const [isRunningScript, setIsRunningScript] = useState(false);

  // HonGong ML/DL Lab State
  const [activeCurriculum, setActiveCurriculum] = useState(HONGONG_CURRICULUMS[0]);
  const [knnLength, setKnnLength] = useState(30.0);
  const [knnWeight, setKnnWeight] = useState(500.0);
  const [regLength, setRegLength] = useState(25.0);
  const [wineAlcohol, setWineAlcohol] = useState(10.5);
  const [wineSugar, setWineSugar] = useState(6.0);
  const [winePh, setWinePh] = useState(3.2);
  const [fashionApparel, setFashionApparel] = useState('tshirt');

  // Seong Nak-Hyeon React 16 Projects Tab State
  const [selectedReactProject, setSelectedReactProject] = useState(NAKHYEON_PROJECTS[0]);

  // Mini-playground Interactive state hooks
  const [demoName, setDemoName] = useState('근육곰');
  const [demoCount, setDemoCount] = useState(0);
  const [demoHover, setDemoHover] = useState(false);
  const [demoClickCount, setDemoClickCount] = useState(0);
  const [demoTimer, setDemoTimer] = useState(0);
  const [demoIsTimerActive, setDemoIsTimerActive] = useState(false);
  const [demoIsLogged, setDemoIsLogged] = useState(false);
  const [demoListItems, setDemoListItems] = useState(['아침 유산소 운동', '벤치 프레스 5세트']);
  const [demoNewItem, setDemoNewItem] = useState('');
  const [demoFormResult, setDemoFormResult] = useState('');
  const [demoTempC, setDemoTempC] = useState('');
  const [demoTempF, setDemoTempF] = useState('');
  const [demoContextTheme, setDemoContextTheme] = useState('dark');
  const demoInputRef = useRef(null);
  const [demoMemoQuery, setDemoMemoQuery] = useState('');
  
  // useReducer bank reducer
  const bankReducer = (state, action) => {
    switch (action.type) {
      case 'deposit': return state + action.amount;
      case 'withdraw': return Math.max(0, state - action.amount);
      default: return state;
    }
  };
  const [bankBalance, dispatchBank] = useReducer(bankReducer, 50000);

  // Axios Mock state
  const [demoApiUser, setDemoApiUser] = useState(null);
  const [demoApiLoading, setDemoApiLoading] = useState(false);
  
  // Router Mock state
  const [demoRouterPath, setDemoRouterPath] = useState('home');

  // Generative AI Tab State
  const [selectedGenAiChapter, setSelectedGenAiChapter] = useState(GENAI_CHAPTERS[0]);
  const [genAiGptPrompt, setGenAiGptPrompt] = useState('이탈 방지용 초특가 특별 마케팅 문구 적어줘.');
  const [genAiGptResponse, setGenAiGptResponse] = useState('');
  const [genAiIsGptLoading, setGenAiIsGptLoading] = useState(false);
  const [genAiDallePrompt, setGenAiDallePrompt] = useState('바벨을 들고 운동하는 귀여운 근육곰 캐릭터, 3D 렌더링');
  const [genAiDalleUrl, setGenAiDalleUrl] = useState('');
  const [genAiIsDalleLoading, setGenAiIsDalleLoading] = useState(false);
  const [genAiRagQuery, setGenAiRagQuery] = useState('회원권을 조기 재등록하면 할인율이 어떻게 됩니까?');
  const [genAiRagScores, setGenAiRagScores] = useState([85, 20, 10]);
  const [genAiRagAnswer, setGenAiRagAnswer] = useState('');
  const [genAiIsRagLoading, setGenAiIsRagLoading] = useState(false);
  const [genAiAgentMember, setGenAiAgentMember] = useState('강철수');
  const [genAiAgentSteps, setGenAiAgentSteps] = useState([]);
  const [genAiIsAgentLoading, setGenAiIsAgentLoading] = useState(false);

  // AI Churn Model Retraining states
  const [isAiTraining, setIsAiTraining] = useState(false);
  const [aiTrainingLogs, setAiTrainingLogs] = useState(['$ Ready to trigger RandomForest retrain...']);

  // Source Code Gallery Tab State
  const [selectedGalleryCodeKey, setSelectedGalleryCodeKey] = useState('springboot_controller');
  const [copySuccess, setCopySuccess] = useState(false);

  // Timer useEffect for Project 4
  useEffect(() => {
    let interval = null;
    if (demoIsTimerActive) {
      interval = setInterval(() => {
        setDemoTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [demoIsTimerActive]);

  // Fetch prediction for database member
  const analyzeMember = async (member) => {
    setSelectedMember(member);
    setLoading(true);
    try {
      const response = await axios.post('/api/churn/predict', {
        recency: member.recency,
        frequencyMonthly: member.frequencyMonthly,
        frequencyWeekly: member.frequencyWeekly,
        visitDropRate: member.visitDropRate,
        contractPeriod: member.contractPeriod,
        age: member.age,
        isLockerUsed: member.isLockerUsed,
        isClothesUsed: member.isClothesUsed
      });
      setPrediction(response.data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      const prob = localPredict(member);
      setPrediction({
        success: true,
        churnProbability: prob,
        riskLevel: prob >= 0.7 ? 'CRITICAL (위험)' : prob >= 0.4 ? 'WARNING (주의)' : 'SAFE (안전)'
      });
    } finally {
      setLoading(false);
    }
  };

  // Run prediction on Simulator change
  useEffect(() => {
    const runSimulatorPrediction = async () => {
      try {
        const response = await axios.post('/api/churn/predict', {
          recency: simRecency,
          frequencyMonthly: simFreqMonthly,
          frequencyWeekly: simFreqWeekly,
          visitDropRate: simDropRate,
          contractPeriod: simContract,
          age: simAge,
          isLockerUsed: simLocker ? 1 : 0,
          isClothesUsed: simClothes ? 1 : 0
        });
        setSimPrediction(response.data);
      } catch (error) {
        const prob = localPredict({
          recency: simRecency,
          frequencyMonthly: simFreqMonthly,
          contractPeriod: simContract
        });
        setSimPrediction({
          success: true,
          churnProbability: prob,
          riskLevel: prob >= 0.7 ? 'CRITICAL (위험)' : prob >= 0.4 ? 'WARNING (주의)' : 'SAFE (안전)'
        });
      }
    };
    runSimulatorPrediction();
  }, [simRecency, simFreqMonthly, simFreqWeekly, simDropRate, simContract, simAge, simLocker, simClothes]);

  const localPredict = (m) => {
    let prob = 0.1;
    if (m.recency > 15) prob += 0.4;
    else if (m.recency > 7) prob += 0.2;
    if (m.frequencyMonthly < 4) prob += 0.3;
    else if (m.frequencyMonthly < 10) prob += 0.15;
    if (m.contractPeriod === 1) prob += 0.15;
    return Math.min(0.97, Math.max(0.03, prob));
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    const firstProg = AUTOMATION_PROGRAMS.find(p => p.category === category);
    if (firstProg) {
      setSelectedProgram(firstProg);
      setTerminalLines([`$ Ready to run ${firstProg.command}...`]);
    }
  };

  const selectProgram = (prog) => {
    setSelectedProgram(prog);
    setTerminalLines([`$ Ready to run ${prog.command}...`]);
  };

  const filteredMembers = members.filter(m =>
    m.name.includes(searchTerm)
  );

  // Line Chart Data
  const lineChartData = {
    labels: ['4주 전', '3주 전', '2주 전', '지난 주'],
    datasets: [
      {
        label: `${selectedMember?.name || '회원'} 주간 방문`,
        data: [
          Math.max(0, Math.round(selectedMember.frequencyMonthly / 4 + 1)),
          Math.max(0, Math.round(selectedMember.frequencyMonthly / 4)),
          Math.max(0, Math.round(selectedMember.frequencyWeekly + 1)),
          selectedMember.frequencyWeekly
        ],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        fill: true
      },
      {
        label: '체육관 평균',
        data: [3.5, 3.4, 3.6, 3.5],
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderDash: [5, 5],
        tension: 0,
        fill: false
      }
    ]
  };

  // Donut Chart Data
  const donutChartData = {
    labels: ['Safe', 'Warning', 'Critical'],
    datasets: [
      {
        data: [3, 1, 2],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }
    ]
  };

  // Feature Importance Horizontal Bar Chart Config for Gym Churn RandomForest Model
  const featureImportanceChartData = {
    labels: [
      '미방문 경과일 (Recency)',
      '최근 30일 방문수 (Frequency)',
      '계약 기간 (Contract)',
      '나이 (Age)',
      '운동복/락커룸 옵션'
    ],
    datasets: [
      {
        label: '특성 기여도 (Feature Importance)',
        data: [0.42, 0.28, 0.18, 0.08, 0.04],
        backgroundColor: ['#f87171', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'],
        borderWidth: 0
      }
    ]
  };

  const getSolutionMessage = (prob) => {
    if (prob >= 0.7) {
      return {
        level: 'danger',
        text: '🔴 위험 등급: 이탈 가능성이 극도로 높습니다! 즉시 1:1 전화 케어, 회원권 연장 특별 프로모션, 또는 GX 무료 수강 쿠폰을 전송하여 긴급 대응하세요.'
      };
    } else if (prob >= 0.4) {
      return {
        level: 'warning',
        text: '🟡 주의 등급: 출석율이 감소하고 있습니다. 안부 문자 및 InBody 무료 측정 예약 안내를 자동 발송하여 방문을 유도하세요.'
      };
    } else {
      return {
        level: 'success',
        text: '🟢 안전 등급: 정상 출석 상태를 유지 중입니다. 주기적인 출석 리워드 마케팅만 유지하면 됩니다.'
      };
    }
  };

  // Terminal Script Simulator Action
  const runAutomationScript = () => {
    setIsRunningScript(true);
    setTerminalLines([`$ ${selectedProgram.command}`]);
    
    selectedProgram.logs.forEach((logLine, index) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, logLine]);
        if (index === selectedProgram.logs.length - 1) {
          setIsRunningScript(false);
        }
      }, 700 * (index + 1));
    });
  };

  // Simulated Model Training action logger
  const runModelTrainingSim = () => {
    setIsAiTraining(true);
    setAiTrainingLogs(['$ python train_model.py']);
    
    const logs = [
      '[INFO] 로컬 가상 회원 행동 데이터셋 적재 시작 (N=1,000)...',
      '[INFO] 데이터셋 전처리: StandardScaler 피처 스케일러 바인딩 완료.',
      '[INFO] RandomForest 모델 학습 세션 개시 (n_estimators=100)...',
      '[INFO] 모델 크로스 벨리데이션 검증 중 (K-Fold = 5)...',
      '[ACCURACY] 모델 기본 정확도(Accuracy) 측정 결과: 91.2%',
      '[ACCURACY] F1-Score: 88.4% / Recall: 86.5%',
      '[INFO] skl2onnx를 통한 ONNX 파일 직렬화 트랜스파일 개시...',
      '[SUCCESS] ONNX 바이너리 파일 모델 빌드 저장 성공: gym_churn_model.onnx',
      '[SUCCESS] 스프링 부트 리소스 리로드 바인딩 완료!'
    ];

    logs.forEach((logLine, index) => {
      setTimeout(() => {
        setAiTrainingLogs(prev => [...prev, logLine]);
        if (index === logs.length - 1) {
          setIsAiTraining(false);
        }
      }, 600 * (index + 1));
    });
  };

  // HonGong Live Predictions
  const getKnnPrediction = () => {
    if (knnLength > 20 && knnWeight > 120) {
      return { species: '도미 (Bream) 🐟', color: 'text-info', prob: 98.4 };
    } else {
      return { species: '빙어 (Smelt) 🐟', color: 'text-success', prob: 94.2 };
    }
  };

  const getRegPrediction = () => {
    const val = 1.01 * regLength * regLength - 21.6 * regLength + 116.8;
    return Math.max(0.1, val).toFixed(1);
  };

  const getWinePrediction = () => {
    if (wineSugar > 5.5) {
      return { type: '화이트 와인 (White) 🥂', color: 'text-warning', prob: 91.2 };
    } else {
      return { type: '레드 와인 (Red) 🍷', color: 'text-danger', prob: 88.6 };
    }
  };

  const getFashionPrediction = () => {
    switch (fashionApparel) {
      case 'tshirt': return { name: '티셔츠 (T-shirt) 👕', prob: 98.2 };
      case 'sneaker': return { name: '운동화 (Sneaker) 👟', prob: 99.4 };
      case 'trouser': return { name: '바지 (Trouser) 👖', prob: 97.8 };
      case 'bag': return { name: '가방 (Bag) 👜', prob: 96.5 };
      default: return { name: '알 수 없음', prob: 0 };
    }
  };

  // Temp converters for Project 8
  const handleTempCChange = (val) => {
    setDemoTempC(val);
    if (val === '') setDemoTempF('');
    else setDemoTempF(((parseFloat(val) * 9) / 5 + 32).toFixed(1));
  };
  const handleTempFChange = (val) => {
    setDemoTempF(val);
    if (val === '') setDemoTempC('');
    else setDemoTempC((((parseFloat(val) - 32) * 5) / 9).toFixed(1));
  };

  // useMemo search calculation for Project 12
  const searchResultsCount = useMemo(() => {
    const defaultWords = ['피트니스', '스쿼트', '데드리프트', '벤치프레스', '단백질', '근비대', '러닝머신'];
    return defaultWords.filter(w => w.includes(demoMemoQuery)).length;
  }, [demoMemoQuery]);

  // Mock Axios action
  const fetchMockUser = () => {
    setDemoApiLoading(true);
    setTimeout(() => {
      setDemoApiUser({
        name: '성낙현 저자',
        book: '성낙현의 JSP 자바 웹 프로그래밍 / 리액트 실습',
        publisher: '한빛미디어',
        pubDate: '2026-07-07'
      });
      setDemoApiLoading(false);
    }, 1000);
  };

  // Generative AI Tab Live Actions Simulation
  const handleGptChatSim = () => {
    setGenAiIsGptLoading(true);
    setGenAiGptResponse('');
    setTimeout(() => {
      setGenAiGptResponse(`🐻 [근육곰 비서]: 안녕하곰! 요청하신 안내 문구 작성을 도와드렸다곰! \n\n"★Smart Gym 깜짝 선물★\n안녕하세요 {고객명}님! 잊으신 덤벨이 자꾸 회원님을 찾고 있다곰! 락커 만료 전에 복귀하시면 얼리버드 10% 할인을 드린다곰! 오늘 당장 같이 운동하러 가자곰! 💪"`);
      setGenAiIsGptLoading(false);
    }, 1200);
  };

  const handleDalleImageSim = () => {
    setGenAiIsDalleLoading(true);
    setGenAiDalleUrl('');
    setTimeout(() => {
      setGenAiDalleUrl('bear');
      setGenAiIsDalleLoading(false);
    }, 1500);
  };

  const handleRagSearchSim = () => {
    setGenAiIsRagLoading(true);
    setGenAiRagAnswer('');
    
    let targetScores = [10, 10, 10];
    if (genAiRagQuery.includes('할인') || genAiRagQuery.includes('혜택') || genAiRagQuery.includes('등록')) {
      targetScores = [92, 15, 8];
    } else if (genAiRagQuery.includes('락커') || genAiRagQuery.includes('운동복') || genAiRagQuery.includes('비용')) {
      targetScores = [12, 94, 15];
    } else {
      targetScores = [10, 12, 88];
    }
    
    setTimeout(() => {
      setGenAiRagScores(targetScores);
      const maxIdx = targetScores.indexOf(Math.max(...targetScores));
      let answerText = "";
      
      if (maxIdx === 0) {
        answerText = "사내 규칙 1번에 따라, 회원권 만료 이전 7일 이내에 다시 재등록하시는 경우 '얼리버드 10% 특별 할인율'이 자동 제공된다곰! 만료일을 꼭 체크해두곰! 🐻💸";
      } else if (maxIdx === 1) {
        answerText = "사내 규칙 2번에 근거하여, 운동복과 락커룸 서비스는 회원권 정가에 별도로 각각 월 11,000원 결제가 필수적이라곰! 🐻💼";
      } else {
        answerText = "사내 규칙 3번에 따라 1일 최대 입장 횟수에는 어떠한 제한도 없곰! 하루에 두 번, 세 번 오셔서 편하게 운동하고 출석 체크 하셔도 괜찮다곰! 🐻🏋️";
      }
      
      setGenAiRagAnswer(answerText);
      setGenAiIsRagLoading(false);
    }, 1000);
  };

  const handleAgentCallSim = () => {
    setGenAiIsAgentLoading(true);
    setGenAiAgentSteps([]);
    
    const selectedRecord = INITIAL_MEMBERS.find(m => m.name === genAiAgentMember) || INITIAL_MEMBERS[0];
    
    setTimeout(() => {
      setGenAiAgentSteps(prev => [...prev, `💬 [User] -> [Agent]: "${selectedRecord.name} 회원의 출석일 및 락커 상태는 어떠한가?"`]);
    }, 300);

    setTimeout(() => {
      setGenAiAgentSteps(prev => [...prev, `⚙️ [Agent] -> [LLM]: 사용자의 쿼리 파싱...`]);
      setGenAiAgentSteps(prev => [...prev, `🧩 [LLM] -> [Agent]: Tool Use 감지 - get_member_status(name: "${selectedRecord.name}")`]);
    }, 900);

    setTimeout(() => {
      setGenAiAgentSteps(prev => [...prev, `💾 [System Database Query]: SELECT * FROM MEMBER WHERE NAME = '${selectedRecord.name}'`]);
      setGenAiAgentSteps(prev => [...prev, `📊 [SQL Result]: ${selectedRecord.name} / 출석일수: ${selectedRecord.frequencyMonthly}회 / 락커이용: ${selectedRecord.isLockerUsed ? '사용함' : '안함'}`]);
    }, 1600);

    setTimeout(() => {
      setGenAiAgentSteps(prev => [...prev, `📝 [LLM 최종 추론]: 쿼리 수집 정보 요약 후 대답 생성`]);
      setGenAiAgentSteps(prev => [...prev, `🐻 [근육곰 AI 에이전트]: "${selectedRecord.name} 회원님은 최근 30일간 총 ${selectedRecord.frequencyMonthly}회 체육관에 출석하셨으며, 현재 락커를 ${selectedRecord.isLockerUsed ? '사용 중' : '미사용'}인 활성 상태이곰! 🐻💪"`]);
      setGenAiIsAgentLoading(false);
    }, 2400);
  };

  // Mascot dynamic comments based on tab
  const getMascotCommentLocal = () => {
    switch (currentTab) {
      case 'database':
        return `안녕하곰! 나는 득근득근 운동을 도와주는 머슬베어(Muscle Bear)라곰! 🐻💪 회원 목록에서 '위험 분석' 버튼을 누르면 AI 리스크 예측치를 즉석에서 분석해 주곰!`;
      case 'simulator':
        return `이탈 예측 시뮬레이터에 오신 걸 환영하곰! 미방문일수와 출석 빈도를 바 조절하면 AI가 실시간으로 이탈율을 다이내믹하게 재산출한다곰! 🐻🔮`;
      case 'automation':
        return `우와! 파이썬 23가지 자동화 스크립트실이곰! 엑셀 병합부터 이메일 전송, 슬랙 업무 보고서 전송까지 실제 터미널 실행 과정을 모사해 준다곰! 🐻🐍`;
      case 'hongong':
        return `혼자 공부하는 머신러닝+딥러닝 학습관이곰! KNN 분류기부터 농어 회귀 곡선, 와인 트리 분기, 그리고 케라스 딥러닝까지 실시간 수치를 바꾸며 배워보곰! 🐻📚`;
      case 'react16':
        return `오! 성낙현 저자의 리액트 실습 16선을 보는 중이곰? 중간의 플레이그라운드를 조작하면 리액트 코드가 즉시 동작한다곰! 🐻⚛️`;
      case 'genai':
        return `만들면서 배우는 생성 AI 실습실에 온 것을 환영하곰! GPT 챗봇 생성부터 DALL-E, RAG 벡터 검색 과정까지 내 손으로 직접 시뮬레이션해볼 수 있다곰! 🐻🤖`;
      case 'aitraining':
        return `여기가 이탈 모델 학습실이곰! 재학습 버튼을 누르면 RandomForest가 특성 기여도를 계산하고 ONNX로 변환되는 전 과정을 실시간 모사해 준다곰! 🐻🧠`;
      case 'gallery':
        return `프로젝트를 만든 모든 파일들을 한 눈에 모은 소스코드 라이브러리라곰! 파일을 하나씩 골라 코드를 📋 복사해 갈 수도 있다곰! 🐻📖`;
      default:
        return `반갑곰! 득근을 위해 오늘도 열심히 코딩하고 운동하곰! 🐻💪`;
    }
  };

  // KNN Scatter Chart Data
  const knnChartDataLocal = {
    datasets: [
      {
        label: '도미 (Bream)',
        data: BREAM_POINTS,
        backgroundColor: '#60a5fa',
        pointRadius: 5
      },
      {
        label: '빙어 (Smelt)',
        data: SMELT_POINTS,
        backgroundColor: '#34d399',
        pointRadius: 5
      },
      {
        label: '현재 입력',
        data: [{ x: knnLength, y: knnWeight }],
        backgroundColor: '#f87171',
        pointRadius: 12,
        pointStyle: 'star'
      }
    ]
  };

  // Perch Regression Line Chart config
  const regChartDataLocal = {
    datasets: [
      {
        label: '농어 데이터',
        data: PERCH_POINTS,
        type: 'scatter',
        backgroundColor: 'rgba(255,255,255,0.4)',
        pointRadius: 4
      },
      {
        label: '다항 회귀 곡선',
        data: generatePerchCurve(),
        type: 'line',
        borderColor: '#34d399',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 0
      },
      {
        label: '예측 좌표',
        data: [{ x: regLength, y: Number(getRegPrediction()) }],
        type: 'scatter',
        backgroundColor: '#f87171',
        pointRadius: 10
      }
    ]
  };

  // Wine Decision Tree Feature Importance Bar Chart config
  const wineChartDataLocal = {
    labels: ['당도 (Sugar)', '알코올 (Alcohol)', 'pH 산도'],
    datasets: [
      {
        label: '특성 중요도',
        data: [0.87, 0.08, 0.05],
        backgroundColor: ['#f87171', '#fbbf24', '#60a5fa'],
        borderWidth: 0
      }
    ]
  };

  // Live Component Playground Switch-Case Renderer for Seong Nak-Hyeon's 16 React Projects
  const renderPlaygroundDemoLocal = () => {
    switch (selectedReactProject.id) {
      case 1:
        return (
          <div>
            <Form.Group className="mb-3">
              <Form.Label className="small text-secondary">이름 입력</Form.Label>
              <Form.Control type="text" className="bg-dark text-white border-secondary small" value={demoName} onChange={e => setDemoName(e.target.value)} />
            </Form.Group>
            <div className="p-3 bg-black border border-secondary rounded-4 text-center">
              <h5 className="fw-bold text-info">안녕하세요, {demoName}님! 🐻👋</h5>
              <span className="small text-secondary">JSX 변수 바인딩 실시간 결과</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="text-center py-3">
            <h5 className="text-white small mb-3">Counter State: {demoCount}</h5>
            <div className="d-flex justify-content-center gap-2">
              <Button variant="info" className="bubbly-btn" onClick={() => setDemoCount(demoCount + 1)}>+ 증가</Button>
              <Button variant="outline-secondary" className="bubbly-btn" onClick={() => setDemoCount(0)}>초기화</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-center py-2">
            <div
              className={`p-3 rounded-4 cursor-pointer text-center ${demoHover ? 'bg-info text-dark' : 'bg-secondary text-white'}`}
              style={{ height: '70px', transition: 'all 0.3s ease' }}
              onMouseEnter={() => setDemoHover(true)}
              onMouseLeave={() => setDemoHover(false)}
              onClick={() => setDemoClickCount(demoClickCount + 1)}
            >
              <strong>{demoHover ? '와우! 마우스가 올라왔곰! 🐻' : '이곳에 마우스를 대어 보곰!'}</strong>
            </div>
            <div className="mt-3 text-secondary small">총 클릭 횟수: <strong className="text-white">{demoClickCount}번</strong></div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-2">
            <h5 className="fw-bold text-success display-6 mb-3">{demoTimer}초</h5>
            <div className="d-flex justify-content-center gap-2">
              <Button variant={demoIsTimerActive ? 'warning' : 'success'} className="bubbly-btn" onClick={() => setDemoIsTimerActive(!demoIsTimerActive)}>
                {demoIsTimerActive ? '⏸ 일시정지' : '▶ 타이머 가동'}
              </Button>
              <Button variant="outline-secondary" className="bubbly-btn" onClick={() => { setDemoTimer(0); setDemoIsTimerActive(false); }}>
                초기화
              </Button>
            </div>
            <span className="small text-secondary mt-2 d-block">useEffect 클린업 타이머 라이프사이클</span>
          </div>
        );
      case 5:
        return (
          <div className="text-center py-3">
            {demoIsLogged ? (
              <div className="p-3 bg-black border border-secondary rounded-4">
                <h6 className="fw-bold text-success">🔑 환영합니다! 로그인 승인됨</h6>
                <Button size="sm" variant="danger" className="mt-2 bubbly-btn" onClick={() => setDemoIsLogged(false)}>로그아웃</Button>
              </div>
            ) : (
              <div className="p-3 bg-black border border-secondary rounded-4">
                <h6 className="text-secondary">🔒 로그인이 필요합니다.</h6>
                <Button size="sm" variant="primary" className="mt-2 bubbly-btn" onClick={() => setDemoIsLogged(true)}>로그인하기</Button>
              </div>
            )}
          </div>
        );
      case 6:
        return (
          <div>
            <Form.Group className="mb-2 d-flex gap-2">
              <Form.Control type="text" placeholder="새 운동 할 일..." className="bg-dark text-white border-secondary small" value={demoNewItem} onChange={e => setDemoNewItem(e.target.value)} />
              <Button size="sm" variant="info" className="bubbly-btn" onClick={() => {
                if (demoNewItem.trim()) {
                  setDemoListItems([...demoListItems, demoNewItem]);
                  setDemoNewItem('');
                }
              }}>추가</Button>
            </Form.Group>
            <ul className="mb-0 text-white small" style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {demoListItems.map((item, idx) => (
                <li key={idx} className="mb-1 d-flex justify-content-between">
                  <span>• {item}</span>
                  <span className="text-danger cursor-pointer small" onClick={() => setDemoListItems(demoListItems.filter((_, i) => i !== idx))}>삭제</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 7:
        return (
          <div>
            <Form.Group className="mb-2">
              <Form.Label className="small text-secondary">선택 과일: {demoFormResult}</Form.Label>
              <Form.Select className="bg-dark text-white border-secondary small" onChange={e => setDemoFormResult(e.target.value)}>
                <option value="">--선택--</option>
                <option value="사과 🍎">사과 🍎</option>
                <option value="바나나 🍌">바나나 🍌</option>
                <option value="멜론 🍈">멜론 🍈</option>
              </Form.Select>
            </Form.Group>
          </div>
        );
      case 8:
        return (
          <Row>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small text-secondary">섭씨 (°C)</Form.Label>
                <Form.Control type="number" className="bg-dark text-white border-secondary small" value={demoTempC} onChange={e => handleTempCChange(e.target.value)} />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small text-secondary">화씨 (°F)</Form.Label>
                <Form.Control type="number" className="bg-dark text-white border-secondary small" value={demoTempF} onChange={e => handleTempFChange(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
        );
      case 9:
        return (
          <div className="p-3 border border-dashed border-info rounded-4 text-center">
            <h6 className="fw-bold text-info">Composition Card (합성)</h6>
            <p className="small text-secondary mb-0">Card 안에 있는 텍스트는 children 프로퍼티로 감싸져 동적 레이아웃 조립이 가능하다곰! 🐻✨</p>
          </div>
        );
      case 10:
        return (
          <div className={`p-3 rounded-4 border ${demoContextTheme === 'dark' ? 'bg-dark border-secondary text-white' : 'bg-white border-light text-dark'}`}>
            <h6 className="fw-bold">전역 테마 Context (Theme)</h6>
            <span className="small d-block mb-3">현재 상태: {demoContextTheme}</span>
            <Button size="sm" variant={demoContextTheme === 'dark' ? 'light' : 'dark'} className="bubbly-btn" onClick={() => setDemoContextTheme(demoContextTheme === 'dark' ? 'light' : 'dark')}>
              테마 전환
            </Button>
          </div>
        );
      case 11:
        return (
          <div className="text-center py-2">
            <Form.Control ref={demoInputRef} type="text" placeholder="포커스 타겟 인풋" className="bg-dark text-white border-secondary mb-2 text-center" />
            <Button size="sm" variant="info" className="bubbly-btn" onClick={() => demoInputRef.current.focus()}>
              인풋으로 커서 강제 이동 (Focus)
            </Button>
          </div>
        );
      case 12:
        return (
          <div>
            <Form.Group className="mb-2">
              <Form.Control type="text" placeholder="검색 키워드 (예: 피트니스, 스쿼트...)" className="bg-dark text-white border-secondary text-center small" value={demoMemoQuery} onChange={e => setDemoMemoQuery(e.target.value)} />
            </Form.Group>
            <div className="p-2 bg-black border border-secondary rounded-4 text-center small">
              매칭 키워드 수: <strong className="text-info">{searchResultsCount}개</strong> (useMemo 최적화 적용됨)
            </div>
          </div>
        );
      case 13:
        return (
          <div className="text-center py-3 bg-black border border-secondary rounded-4">
            <span className="text-secondary small">Custom Hook: useWindowSize</span>
            <h5 className="fw-bold text-info mt-2">브라우저 가로폭: {window.innerWidth} px</h5>
            <span className="small text-secondary">리사이즈 감지 중</span>
          </div>
        );
      case 14:
        return (
          <div>
            <div className="p-2 rounded bg-black text-center mb-3">
              <span className="small text-secondary">은행 잔액: </span>
              <strong className="text-success">{bankBalance.toLocaleString()} 원</strong>
            </div>
            <div className="d-flex justify-content-center gap-2">
              <Button size="sm" variant="info" className="bubbly-btn" onClick={() => dispatchBank({ type: 'deposit', amount: 10000 })}>+ 1만원 입금</Button>
              <Button size="sm" variant="danger" className="bubbly-btn" onClick={() => dispatchBank({ type: 'withdraw', amount: 10000 })}>- 1만원 출금</Button>
            </div>
          </div>
        );
      case 15:
        return (
          <div className="text-center py-2">
            {demoApiLoading ? (
              <Spinner animation="border" size="sm" />
            ) : demoApiUser ? (
              <div className="p-2 bg-black rounded text-start small">
                <strong>저자명:</strong> {demoApiUser.name}<br/>
                <strong>추천책:</strong> {demoApiUser.book}<br/>
                <strong>출판사:</strong> {demoApiUser.publisher}
              </div>
            ) : (
              <Button size="sm" variant="primary" className="bubbly-btn" onClick={fetchMockUser}>
                Axios API 호출 시뮬레이션
              </Button>
            )}
          </div>
        );
      case 16:
        return (
          <div>
            <div className="d-flex justify-content-around mb-2 bg-black p-1 rounded-pill">
              <span className={`cursor-pointer px-2 py-1 rounded-pill ${demoRouterPath === 'home' ? 'bg-primary' : 'text-secondary'}`} onClick={() => setDemoRouterPath('home')}>Home</span>
              <span className={`cursor-pointer px-2 py-1 rounded-pill ${demoRouterPath === 'profile' ? 'bg-primary' : 'text-secondary'}`} onClick={() => setDemoRouterPath('profile')}>Profile</span>
              <span className={`cursor-pointer px-2 py-1 rounded-pill ${demoRouterPath === 'settings' ? 'bg-primary' : 'text-secondary'}`} onClick={() => setDemoRouterPath('settings')}>Settings</span>
            </div>
            <div className="p-3 bg-black border border-secondary rounded-4 text-center">
              <span className="small text-secondary">가상 라우터 컴포넌트 렌더링</span>
              <h6 className="fw-bold text-white mt-1">/{demoRouterPath.toUpperCase()} 뷰 노출</h6>
            </div>
          </div>
        );
      default:
        return <p className="text-center small text-secondary">데모가 없습니다.</p>;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Top Header */}
      <header className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fw-bold text-white mb-1">🏋️‍♂️ Smart Gym Admin</h1>
          <p className="text-secondary mb-0">AI 고객 이탈 분석 & 피트니스 회원 관리 대시보드</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Badge bg="success" className="p-2">정상 운영 중</Badge>
          <Badge bg="primary" className="p-2">오라클 DB 연결됨 (Oracle SQL)</Badge>
        </div>
      </header>

      {/* Overview Cards Row */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="glass-panel text-white p-3 border-0">
            <span className="text-secondary small fw-bold">전체 회원 수</span>
            <h2 className="fw-bold text-white mt-1">1,240명</h2>
            <span className="text-success small">▲ 전월 대비 4.2% 증가</span>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel text-white p-3 border-0">
            <span className="text-secondary small fw-bold">이탈 위험군 (Critical)</span>
            <h2 className="fw-bold text-danger mt-1">42명</h2>
            <span className="text-danger small">▼ 집중 케어 관리 요망</span>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel text-white p-3 border-0">
            <span className="text-secondary small fw-bold">평균 미방문일 (Recency)</span>
            <h2 className="fw-bold text-warning mt-1">6.8일</h2>
            <span className="text-secondary small">정상 범주 유지</span>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel text-white p-3 border-0">
            <span className="text-secondary small fw-bold">이번 달 회원 재등록률</span>
            <h2 className="fw-bold text-info mt-1">91.4%</h2>
            <span className="text-success small">▲ 목표 대비 1.4% 상회</span>
          </Card>
        </Col>
      </Row>

      {/* Main Layout Grid */}
      <Row className="g-4">
        {/* Left Side: Members database / Simulator / Automation / HonGong Lab / Seong Nak-Hyeon React / Generative AI / AI Training */}
        <Col lg={7}>
          <Card className="glass-panel text-white border-0 p-4 h-100">
            <Tabs defaultActiveKey="database" id="dashboard-tabs" className="custom-tabs mb-3 border-bottom-0" onSelect={(k) => setCurrentTab(k)}>
              <Tab eventKey="database" title="📊 회원 데이터베이스">
                <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
                  <h4 className="mb-0 fw-bold">회원 명단</h4>
                  <Form.Control
                    type="text"
                    placeholder="회원 이름 검색..."
                    className="w-50 bg-dark text-white border-secondary rounded-pill px-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="table-responsive">
                  <Table hover variant="dark" className="align-middle mb-0 custom-table">
                    <thead>
                      <tr>
                        <th>이름</th>
                        <th>성별/나이</th>
                        <th>이용권</th>
                        <th>미방문일</th>
                        <th>월 출석</th>
                        <th>액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((m) => (
                        <tr
                          key={m.id}
                          className={selectedMember?.id === m.id ? 'table-active-row' : ''}
                          onClick={() => setSelectedMember(m)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="fw-semibold">{m.name}</td>
                          <td>{m.gender} / {m.age}세</td>
                          <td>{m.contractPeriod}개월권</td>
                          <td>{m.recency}일</td>
                          <td>{m.frequencyMonthly}회</td>
                          <td>
                            <Button
                              size="sm"
                              className="bubbly-btn btn-outline-info"
                              onClick={(e) => {
                                e.stopPropagation();
                                analyzeMember(m);
                              }}
                            >
                              위험 분석
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab>

              <Tab eventKey="simulator" title="🔮 AI 실시간 이탈 시뮬레이터">
                <p className="text-secondary small mt-3">
                  다양한 이용 특징을 직접 조절하며 AI 모델이 회원의 이탈 리스크를 실시간으로 어떻게 측정하는지 시뮬레이션해 보세요.
                </p>
                <Row className="g-3 mt-1">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-secondary">미방문 경과일 (Recency): {simRecency}일</Form.Label>
                      <Form.Range min="0" max="30" value={simRecency} onChange={(e) => setSimRecency(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-secondary">최근 30일 방문 횟수: {simFreqMonthly}회</Form.Label>
                      <Form.Range min="0" max="30" value={simFreqMonthly} onChange={(e) => setSimFreqMonthly(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-secondary">최근 7일 방문 횟수: {simFreqWeekly}회</Form.Label>
                      <Form.Range min="0" max="7" value={simFreqWeekly} onChange={(e) => setSimFreqWeekly(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-secondary">방문 변화율 (Drop Rate): {(simDropRate * 100).toFixed(0)}%</Form.Label>
                      <Form.Range min="-1" max="1" step="0.1" value={simDropRate} onChange={(e) => setSimDropRate(Number(e.target.value))} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-secondary">회원권 계약기간: {simContract}개월</Form.Label>
                      <Form.Select className="bg-dark text-white border-secondary rounded-pill px-3" value={simContract} onChange={(e) => setSimContract(Number(e.target.value))}>
                        <option value={1}>1개월권 (단기)</option>
                        <option value={3}>3개월권</option>
                        <option value={6}>6개월권</option>
                        <option value={12}>12개월권 (장기)</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-secondary">나이: {simAge}세</Form.Label>
                      <Form.Range min="15" max="80" value={simAge} onChange={(e) => setSimAge(Number(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check type="switch" id="locker-switch" label="락커 이용 중" checked={simLocker} onChange={(e) => setSimLocker(e.target.checked)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check type="switch" id="clothes-switch" label="운동복 이용 중" checked={simClothes} onChange={(e) => setSimClothes(e.target.checked)} />
                    </Form.Group>
                  </Col>
                </Row>

                {simPrediction && (
                  <Card className="p-3 bg-dark border-secondary mt-3 rounded-4">
                    <h5 className="fw-bold">시뮬레이션 AI 예측 결과</h5>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="small text-secondary">이탈 확률:</span>
                      <h4 className="fw-bold text-info mb-0">{(simPrediction.churnProbability * 100).toFixed(1)}%</h4>
                    </div>
                    <ProgressBar
                      now={simPrediction.churnProbability * 100}
                      variant={simPrediction.churnProbability >= 0.7 ? 'danger' : simPrediction.churnProbability >= 0.4 ? 'warning' : 'success'}
                      className="my-2 bg-secondary"
                      style={{ height: '8px' }}
                    />
                    <div className="text-white small mt-1">{getSolutionMessage(simPrediction.churnProbability).text}</div>
                  </Card>
                )}
              </Tab>

              <Tab eventKey="automation" title="🐍 파이썬 일잘러 자동화 (23선)">
                <p className="text-secondary small mt-3">
                  사무 업무 효율을 혁신적으로 줄여주는 파이썬 일잘러 자동화 프로그램 23선입니다. 카테고리별로 스크립트를 둘러보고 동작 과정을 모사해 보세요.
                </p>

                <div className="d-flex gap-2 mb-3 mt-2 overflow-auto pb-2">
                  <Button size="sm" variant={activeCategory === 'excel' ? 'info' : 'dark'} className="rounded-pill" onClick={() => handleCategoryChange('excel')}>📊 엑셀 및 데이터</Button>
                  <Button size="sm" variant={activeCategory === 'file' ? 'info' : 'dark'} className="rounded-pill" onClick={() => handleCategoryChange('file')}>📂 파일/폴더 관리</Button>
                  <Button size="sm" variant={activeCategory === 'crawl' ? 'info' : 'dark'} className="rounded-pill" onClick={() => handleCategoryChange('crawl')}>🌐 웹 크롤링</Button>
                  <Button size="sm" variant={activeCategory === 'msg' ? 'info' : 'dark'} className="rounded-pill" onClick={() => handleCategoryChange('msg')}>✉️ 메일/메시지</Button>
                  <Button size="sm" variant={activeCategory === 'doc' ? 'info' : 'dark'} className="rounded-pill" onClick={() => handleCategoryChange('doc')}>📄 문서/이미지</Button>
                </div>
                
                <Row className="g-3">
                  <Col md={5}>
                    <h6 className="fw-bold text-secondary small mb-2">프로그램 선택</h6>
                    <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '350px' }}>
                      {AUTOMATION_PROGRAMS.filter(p => p.category === activeCategory).map(p => (
                        <Button
                          key={p.id}
                          variant={selectedProgram.id === p.id ? 'primary' : 'outline-secondary'}
                          className="text-start py-2 px-3 small border-0 rounded-4"
                          style={{ fontSize: '13px' }}
                          onClick={() => selectProgram(p)}
                        >
                          {p.title}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-dark border border-secondary rounded-4">
                      <h6 className="fw-bold text-white small">💡 터미널 수동 실행법</h6>
                      <span className="text-secondary small d-block mb-2">본인 PC 터미널에서 이 코드를 단독 실행하려면 다음을 입력하세요:</span>
                      <code className="text-info small bg-black p-2 d-block rounded fw-bold text-center">
                        {selectedProgram.command}
                      </code>
                    </div>
                  </Col>

                  <Col md={7}>
                    <h6 className="fw-bold text-secondary small mb-1">{selectedProgram.title} - 파이썬 소스코드</h6>
                    <div className="code-viewer-container mb-3" style={{ maxHeight: '200px' }}>
                      <pre className="m-0"><code style={{ fontSize: '11px' }}>{selectedProgram.code}</code></pre>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-white small">💻 터미널 시뮬레이터 콘솔</h6>
                      <Button
                        size="sm"
                        variant="success"
                        style={{ fontSize: '12px' }}
                        className="bubbly-btn rounded-pill px-3"
                        disabled={isRunningScript}
                        onClick={runAutomationScript}
                      >
                        {isRunningScript ? <Spinner animation="border" size="sm" /> : '▶ 실행하기'}
                      </Button>
                    </div>

                    <div className="terminal-header">
                      <div>
                        <span className="terminal-dot red"></span>
                        <span className="terminal-dot yellow"></span>
                        <span className="terminal-dot green"></span>
                        <span>Console Logs</span>
                      </div>
                      <span>bash</span>
                    </div>
                    <div className="terminal-box" style={{ minHeight: '120px', maxHeight: '180px' }}>
                      {terminalLines.map((line, idx) => (
                        <div key={idx} className="mb-1">{line}</div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="hongong" title="📚 혼공 ML/DL 실습">
                <p className="text-secondary small mt-3">
                  베스트셀러 책 [혼자 공부하는 머신러닝+딥러닝]의 예제 알고리즘을 실시간 슬라이더와 시각화 차트로 실습해 볼 수 있는 체험관입니다.
                </p>

                <Row className="g-3 mt-1">
                  <Col md={4}>
                    <h6 className="fw-bold text-secondary small mb-2">학습 커리큘럼</h6>
                    <div className="d-flex flex-column gap-2">
                      {HONGONG_CURRICULUMS.map(c => (
                        <Button
                          key={c.id}
                          variant={activeCurriculum.id === c.id ? 'info' : 'dark'}
                          className="text-start py-2 px-3 border-0 small rounded-4"
                          style={{ fontSize: '12px' }}
                          onClick={() => setActiveCurriculum(c)}
                        >
                          {c.title}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-dark border border-secondary rounded-4">
                      <h6 className="fw-bold text-white small">📖 단독 실습 파일</h6>
                      <span className="text-secondary small d-block mb-2">로컬 환경에서 직접 모델을 구동하고 테스트하시려면 아래 파일을 실행하세요:</span>
                      <code className="text-info small bg-black p-2 d-block rounded fw-bold text-center" style={{ fontSize: '11px' }}>
                        hongong_mldl_practice.py
                      </code>
                    </div>
                  </Col>

                  <Col md={8}>
                    <Card className="p-3 bg-dark border-secondary mb-3 rounded-4">
                      <h6 className="fw-bold text-white mb-2">{activeCurriculum.title} - 시뮬레이션</h6>
                      
                      {activeCurriculum.id === 'knn' && (
                        <div>
                          <Row>
                            <Col xs={6}>
                              <Form.Group className="mb-2">
                                <Form.Label className="small text-secondary">생선 길이: {knnLength}cm</Form.Label>
                                <Form.Range min="5" max="45" step="0.5" value={knnLength} onChange={(e) => setKnnLength(Number(e.target.value))} />
                              </Form.Group>
                            </Col>
                            <Col xs={6}>
                              <Form.Group className="mb-2">
                                <Form.Label className="small text-secondary">생선 무게: {knnWeight}g</Form.Label>
                                <Form.Range min="5" max="1000" step="5" value={knnWeight} onChange={(e) => setKnnWeight(Number(e.target.value))} />
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="p-2 rounded bg-black border border-secondary mt-2">
                            <span className="small text-secondary">AI 예측 결과: </span>
                            <strong className={getKnnPrediction().color}>{getKnnPrediction().species}</strong>
                            <span className="small text-secondary ms-2">({getKnnPrediction().prob}% 확신)</span>
                          </div>
                          
                          <div className="mt-3" style={{ height: '180px' }}>
                            <Scatter
                              data={knnChartDataLocal}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { labels: { color: '#f3f4f6' } } },
                                scales: {
                                  x: { title: { display: true, text: '길이 (cm)', color: '#9ca3af' }, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                  y: { title: { display: true, text: '무게 (g)', color: '#9ca3af' }, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {activeCurriculum.id === 'regression' && (
                        <div>
                          <Form.Group className="mb-2">
                            <Form.Label className="small text-secondary">농어의 측정 길이: {regLength}cm</Form.Label>
                            <Form.Range min="10" max="45" step="0.5" value={regLength} onChange={(e) => setRegLength(Number(e.target.value))} />
                          </Form.Group>
                          <div className="p-2 rounded bg-black border border-secondary mt-2">
                            <span className="small text-secondary">AI 예측 무게: </span>
                            <strong className="text-info">{getRegPrediction()} g</strong>
                          </div>

                          <div className="mt-3" style={{ height: '180px' }}>
                            <Line
                              data={regChartDataLocal}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                  x: { type: 'linear', title: { display: true, text: '길이 (cm)', color: '#9ca3af' }, ticks: { color: '#9ca3af' }, grid: { display: false } },
                                  y: { title: { display: true, text: '무게 (g)', color: '#9ca3af' }, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {activeCurriculum.id === 'wine' && (
                        <div>
                          <Row>
                            <Col xs={4}>
                              <Form.Group className="mb-2">
                                <Form.Label className="small text-secondary">도수: {wineAlcohol}%</Form.Label>
                                <Form.Range min="8" max="15" step="0.1" value={wineAlcohol} onChange={(e) => setWineAlcohol(Number(e.target.value))} />
                              </Form.Group>
                            </Col>
                            <Col xs={4}>
                              <Form.Group className="mb-2">
                                <Form.Label className="small text-secondary">당도: {wineSugar}</Form.Label>
                                <Form.Range min="0" max="15" step="0.2" value={wineSugar} onChange={(e) => setWineSugar(Number(e.target.value))} />
                              </Form.Group>
                            </Col>
                            <Col xs={4}>
                              <Form.Group className="mb-2">
                                <Form.Label className="small text-secondary">pH: {winePh}</Form.Label>
                                <Form.Range min="2.5" max="4.0" step="0.05" value={winePh} onChange={(e) => setWinePh(Number(e.target.value))} />
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="p-2 rounded bg-black border border-secondary mt-2">
                            <span className="small text-secondary">의사결정트리 판정: </span>
                            <strong className={getWinePrediction().color}>{getWinePrediction().type}</strong>
                            <span className="small text-secondary ms-2">({getWinePrediction().prob}% 정확도)</span>
                          </div>

                          <div className="mt-3" style={{ height: '180px' }}>
                            <Bar
                              data={wineChartDataLocal}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                  x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
                                  y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {activeCurriculum.id === 'nn' && (
                        <div>
                          <Form.Group className="mb-2">
                            <Form.Label className="small text-secondary">입력 의류 유형 선택</Form.Label>
                            <Form.Select className="bg-dark text-white border-secondary rounded-pill px-3 small" value={fashionApparel} onChange={(e) => setFashionApparel(e.target.value)}>
                              <option value="tshirt">👕 T-shirt (티셔츠)</option>
                              <option value="sneaker">👟 Sneaker (운동화)</option>
                              <option value="trouser">👖 Trouser (바지)</option>
                              <option value="bag">👜 Bag (가방)</option>
                            </Form.Select>
                          </Form.Group>

                          <Row className="mt-3 align-items-center">
                            <Col xs={5} className="d-flex flex-column align-items-center">
                              <span className="small text-secondary mb-2">입력 픽셀 데이터 (8x8)</span>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(8, 15px)',
                                gridTemplateRows: 'repeat(8, 15px)',
                                gap: '1px',
                                background: '#111827',
                                padding: '5px',
                                borderRadius: '8px',
                                border: '1px solid #374151'
                              }}>
                                {APPAREL_MAPS[fashionApparel].map((val, idx) => (
                                  <div key={idx} style={{
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: val === 1 ? '#60a5fa' : '#1f2937',
                                    borderRadius: '2px'
                                  }} />
                                ))}
                              </div>
                            </Col>
                            
                            <Col xs={7}>
                              <span className="small text-secondary">은닉층 연산 활성화 함수: <strong>Sigmoid</strong></span>
                              <div className="p-3 rounded-4 bg-black border border-secondary mt-2">
                                <span className="small text-secondary">인공신경망 소프트맥스 출력:</span>
                                <h5 className="fw-bold text-success mt-1">{getFashionPrediction().name}</h5>
                                <ProgressBar now={getFashionPrediction().prob} label={`${getFashionPrediction().prob}%`} variant="success" className="mt-2 bg-dark" />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Card>

                    <h6 className="fw-bold text-secondary small mb-1">📖 혼공 예제 코드</h6>
                    <div className="code-viewer-container" style={{ maxHeight: '200px' }}>
                      <pre className="m-0"><code style={{ fontSize: '11px' }}>{activeCurriculum.pythonCode}</code></pre>
                    </div>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="react16" title="⚛️ 성낙현 React 16선">
                <p className="text-secondary small mt-3">
                  [성낙현의 리액트 프로그래밍] 교재의 16개 핵심 실습 코드를 훑어보고, 각 컴포넌트의 기능이 화면에서 즉시 살아 움직이는 인터랙티브 플레이그라운드입니다.
                </p>
                <Row className="g-3 mt-1">
                  <Col md={4}>
                    <h6 className="fw-bold text-secondary small mb-2">리액트 프로젝트 목록</h6>
                    <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '350px' }}>
                      {NAKHYEON_PROJECTS.map(p => (
                        <Button
                          key={p.id}
                          variant={selectedReactProject.id === p.id ? 'info' : 'dark'}
                          className="text-start py-2 px-3 border-0 small rounded-4"
                          style={{ fontSize: '12px' }}
                          onClick={() => setSelectedReactProject(p)}
                        >
                          {p.title}
                        </Button>
                      ))}
                    </div>
                  </Col>

                  <Col md={8}>
                    <Card className="p-3 bg-dark border-secondary mb-3 rounded-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold text-white mb-0">🎯 라이브 플레이그라운드</h6>
                        <Badge bg="success">Live React Node</Badge>
                      </div>
                      <p className="text-secondary small mb-3">{selectedReactProject.description}</p>
                      
                      <div className="p-3 rounded-4 bg-black border border-secondary mb-3" style={{ minHeight: '140px' }}>
                        {renderPlaygroundDemoLocal()}
                      </div>
                    </Card>

                    <h6 className="fw-bold text-secondary small mb-1">📖 핵심 소스코드</h6>
                    <div className="code-viewer-container mb-3" style={{ maxHeight: '180px' }}>
                      <pre className="m-0"><code style={{ fontSize: '11px' }}>{selectedReactProject.code}</code></pre>
                    </div>

                    <Card className="p-3 bg-dark border-secondary rounded-4">
                      <h6 className="fw-bold text-white small">💡 핵심 개념 설명</h6>
                      <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>{selectedReactProject.theory}</p>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="genai" title="🤖 생성 AI 실습관">
                <p className="text-secondary small mt-3">
                  베스트셀러 책 [만들면서 배우는 생성 AI]의 GPT 챗봇, DALL-E 배너 생성, RAG 벡터 유사도 검색 및 에이전트 도구 호출 과정을 직접 모사 구현하는 실습관입니다.
                </p>
                <Row className="g-3 mt-1">
                  <Col md={4}>
                    <h6 className="fw-bold text-secondary small mb-2">생성 AI 주제 목록</h6>
                    <div className="d-flex flex-column gap-2">
                      {GENAI_CHAPTERS.map(c => (
                        <Button
                          key={c.id}
                          variant={selectedGenAiChapter.id === c.id ? 'info' : 'dark'}
                          className="text-start py-2 px-3 border-0 small rounded-4"
                          style={{ fontSize: '12px' }}
                          onClick={() => setSelectedGenAiChapter(c)}
                        >
                          {c.title}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-dark border border-secondary rounded-4">
                      <h6 className="fw-bold text-white small">📖 단독 실습 파일</h6>
                      <span className="text-secondary small d-block mb-2">로컬 환경에서 직접 생성 AI API 구조를 실행하려면 아래 파일을 참고하세요:</span>
                      <code className="text-info small bg-black p-2 d-block rounded fw-bold text-center" style={{ fontSize: '11px' }}>
                        generative_ai_practice.py
                      </code>
                    </div>
                  </Col>

                  <Col md={8}>
                    <Card className="p-3 bg-dark border-secondary mb-3 rounded-4">
                      <h6 className="fw-bold text-white mb-2">{selectedGenAiChapter.title} - 시뮬레이션</h6>
                      
                      {selectedGenAiChapter.id === 'gpt' && (
                        <div>
                          <Form.Group className="mb-2">
                            <Form.Label className="small text-secondary">챗봇 프롬프트 입력</Form.Label>
                            <Form.Control type="text" className="bg-dark text-white border-secondary small" value={genAiGptPrompt} onChange={e => setGenAiGptPrompt(e.target.value)} />
                          </Form.Group>
                          <Button size="sm" variant="info" className="bubbly-btn rounded-pill px-3 mb-3" disabled={genAiIsGptLoading} onClick={handleGptChatSim}>
                            {genAiIsGptLoading ? <Spinner animation="border" size="sm" /> : '💡 GPT 답변 생성하기'}
                          </Button>
                          
                          {genAiGptResponse && (
                            <div className="p-3 rounded-4 bg-black border border-secondary text-white small" style={{ whiteSpace: 'pre-line', maxHeight: '180px', overflowY: 'auto' }}>
                              {genAiGptResponse}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedGenAiChapter.id === 'dalle' && (
                        <div>
                          <Form.Group className="mb-2">
                            <Form.Label className="small text-secondary">생성할 배너/이미지 묘사</Form.Label>
                            <Form.Control type="text" className="bg-dark text-white border-secondary small" value={genAiDallePrompt} onChange={e => setGenAiDallePrompt(e.target.value)} />
                          </Form.Group>
                          <Button size="sm" variant="info" className="bubbly-btn rounded-pill px-3 mb-3" disabled={genAiIsDalleLoading} onClick={handleDalleImageSim}>
                            {genAiIsDalleLoading ? <Spinner animation="border" size="sm" /> : '🎨 DALL-E 배너 이미지 생성'}
                          </Button>
                          
                          <div className="d-flex justify-content-center align-items-center bg-black border border-secondary rounded-4" style={{ height: '180px' }}>
                            {genAiIsDalleLoading ? (
                              <div className="text-center text-secondary small">
                                <Spinner animation="border" variant="info" className="mb-2" /><br/>
                                DALL-E가 노이즈 제거 단계를 연산 중이곰... 🐻🎨
                              </div>
                            ) : genAiDalleUrl ? (
                              <svg width="120" height="120" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
                                <circle cx="50" cy="45" r="18" fill="#fbbf24" />
                                <circle cx="35" cy="30" r="6" fill="#fbbf24" />
                                <circle cx="65" cy="30" r="6" fill="#fbbf24" />
                                <circle cx="43" cy="42" r="2" fill="#000" />
                                <circle cx="57" cy="42" r="2" fill="#000" />
                                <path d="M 45 50 Q 50 54 55 50" stroke="#000" strokeWidth="2" fill="none" />
                                <rect x="15" y="65" width="70" height="6" rx="3" fill="#94a3b8" />
                                <circle cx="15" cy="68" r="10" fill="#3b82f6" />
                                <circle cx="85" cy="68" r="10" fill="#3b82f6" />
                                <text x="50" y="93" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="bold">DALL-E 3: 득근곰</text>
                              </svg>
                            ) : (
                              <span className="text-secondary small">프롬프트를 입력하고 배너를 그려 보곰!</span>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedGenAiChapter.id === 'rag' && (
                        <div>
                          <Form.Group className="mb-2">
                            <Form.Label className="small text-secondary">규정 매뉴얼 질문</Form.Label>
                            <Form.Control type="text" className="bg-dark text-white border-secondary small" value={genAiRagQuery} onChange={e => setGenAiRagQuery(e.target.value)} />
                          </Form.Group>
                          <Button size="sm" variant="info" className="bubbly-btn rounded-pill px-3 mb-3" disabled={genAiIsRagLoading} onClick={handleRagSearchSim}>
                            {genAiIsRagLoading ? <Spinner animation="border" size="sm" /> : '🔍 벡터 유사도 검색 & 답변'}
                          </Button>
                          
                          <div className="mb-3">
                            <span className="small text-secondary d-block mb-1">벡터 데이터베이스 코사인 유사도 분석:</span>
                            <div className="small text-light mb-1">문서 1: 조기 재등록 할인 혜택 (유사도: <strong className="text-info">{genAiRagScores[0]}%</strong>)</div>
                            <ProgressBar now={genAiRagScores[0]} variant="info" className="bg-dark mb-2" style={{ height: '8px' }} />
                            
                            <div className="small text-light mb-1">문서 2: 운동복 및 락커 대여 가격 (유사도: <strong className="text-warning">{genAiRagScores[1]}%</strong>)</div>
                            <ProgressBar now={genAiRagScores[1]} variant="warning" className="bg-dark mb-2" style={{ height: '8px' }} />
                            
                            <div className="small text-light mb-1">문서 3: 1일 출석 한도 제한 규정 (유사도: <strong className="text-success">{genAiRagScores[2]}%</strong>)</div>
                            <ProgressBar now={genAiRagScores[2]} variant="success" className="bg-dark mb-2" style={{ height: '8px' }} />
                          </div>

                          {genAiRagAnswer && (
                            <div className="p-3 rounded-4 bg-black border border-secondary text-info small" style={{ whiteSpace: 'pre-line' }}>
                              <strong>최종 생성 답변:</strong><br/>
                              {genAiRagAnswer}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedGenAiChapter.id === 'agent' && (
                        <div>
                          <Form.Group className="mb-2">
                            <Form.Label className="small text-secondary">조회할 고객 회원 명단 선택</Form.Label>
                            <Form.Select className="bg-dark text-white border-secondary rounded-pill px-3 small" value={genAiAgentMember} onChange={e => setGenAiAgentMember(e.target.value)}>
                              {members.map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          <Button size="sm" variant="info" className="bubbly-btn rounded-pill px-3 mb-3" disabled={genAiIsAgentLoading} onClick={handleAgentCallSim}>
                            {genAiIsAgentLoading ? <Spinner animation="border" size="sm" /> : '⚙️ 에이전트 질문 전송'}
                          </Button>
                          
                          <div className="terminal-header" style={{ fontSize: '10px' }}>
                            <span>Agent Step Executor (Function Calling)</span>
                          </div>
                          <div className="terminal-box" style={{ minHeight: '140px', maxHeight: '200px', fontSize: '11px', overflowY: 'auto' }}>
                            {genAiIsAgentLoading && genAiAgentSteps.length === 0 ? (
                              <div className="text-secondary">에이전트가 툴 사용 의사결정을 돌리고 있곰...</div>
                            ) : (
                              genAiAgentSteps.map((step, idx) => (
                                <div key={idx} className="mb-1">{step}</div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </Card>

                    <h6 className="fw-bold text-secondary small mb-1">📖 생성 AI 핵심 코드</h6>
                    <div className="code-viewer-container mb-3" style={{ maxHeight: '180px' }}>
                      <pre className="m-0"><code style={{ fontSize: '11px' }}>{selectedGenAiChapter.code}</code></pre>
                    </div>

                    <Card className="p-3 bg-dark border-secondary rounded-4">
                      <h6 className="fw-bold text-white small">💡 핵심 아키텍처 설명</h6>
                      <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>{selectedGenAiChapter.theory}</p>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="aitraining" title="🧠 AI 모델 학습 엔진">
                <p className="text-secondary small mt-3">
                  이탈 예측 서비스 모델(RandomForestClassifier)을 직접 생성하고 ONNX 모델로 직렬화하여 배포하는 파이썬 기계학습 학습 시뮬레이터입니다.
                </p>
                <Row className="g-3 mt-1">
                  {/* Left Column: Visual Metrics & Retraining control */}
                  <Col md={5}>
                    <Card className="p-3 bg-dark border-secondary mb-3 rounded-4">
                      <h6 className="fw-bold text-white mb-2">🎯 AI 모델 기본 메트릭</h6>
                      <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
                        <span className="small text-secondary">학습 정확도 (Accuracy):</span>
                        <strong className="text-success">91.2%</strong>
                      </div>
                      <ProgressBar now={91.2} variant="success" className="bg-dark mb-3" style={{ height: '6px' }} />
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-secondary">조화평균 F1-Score:</span>
                        <strong className="text-info">88.4%</strong>
                      </div>
                      <ProgressBar now={88.4} variant="info" className="bg-dark mb-3" style={{ height: '6px' }} />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-secondary">검출 재현율 (Recall):</span>
                        <strong className="text-warning">86.5%</strong>
                      </div>
                      <ProgressBar now={86.5} variant="warning" className="bg-dark mb-3" style={{ height: '6px' }} />

                      <Button
                        size="sm"
                        variant="info"
                        className="bubbly-btn w-100 rounded-pill mt-2"
                        disabled={isAiTraining}
                        onClick={runModelTrainingSim}
                      >
                        {isAiTraining ? <Spinner animation="border" size="sm" /> : '🔄 AI 모델 재학습하기'}
                      </Button>
                    </Card>

                    <div className="terminal-header">
                      <span>MLOps Training Logger</span>
                    </div>
                    <div className="terminal-box" style={{ minHeight: '140px', maxHeight: '200px', fontSize: '11px', overflowY: 'auto' }}>
                      {aiTrainingLogs.map((logLine, idx) => (
                        <div key={idx} className="mb-1">{logLine}</div>
                      ))}
                    </div>
                  </Col>

                  {/* Right Column: Code viewer and Feature importance chart */}
                  <Col md={7}>
                    <Card className="p-3 bg-dark border-secondary mb-3 rounded-4">
                      <h6 className="fw-bold text-white mb-3">📊 랜덤 포레스트 특성 중요도 (Feature Importance)</h6>
                      <div style={{ height: '180px' }}>
                        <Bar
                          data={featureImportanceChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y', // Horizontal bar chart!
                            plugins: { legend: { display: false } },
                            scales: {
                              x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                              y: { ticks: { color: '#9ca3af' }, grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                      <span className="small text-secondary d-block mt-2 text-center">
                        미방문일수(Recency, 42%)와 출석수(28%)가 이탈을 판단하는 가장 지배적인 변수입니다.
                      </span>
                    </Card>

                    <h6 className="fw-bold text-secondary small mb-1">📖 train_model.py 소스코드</h6>
                    <div className="code-viewer-container" style={{ maxHeight: '180px' }}>
                      <pre className="m-0"><code style={{ fontSize: '11px' }}>{PYTHON_TRAIN_CODE}</code></pre>
                    </div>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="gallery" title="📖 소스코드 갤러리">
                <p className="text-secondary small mt-3">
                  이 대시보드 시스템을 구축하는 데 활용된 백엔드(자바), 프런트엔드(리액트), 기계학습 모델링 및 데이터베이스(SQL) 소스코드를 파일별로 나누어 한눈에 쉽게 확인하고 복사할 수 있습니다.
                </p>
                <Row className="g-3 mt-1">
                  <Col md={3}>
                    <h6 className="fw-bold text-secondary small mb-2">소스코드 파일 선택</h6>
                    <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '420px' }}>
                      {Object.keys(GALLERY_CODES).map(key => (
                        <Button
                          key={key}
                          variant={selectedGalleryCodeKey === key ? 'info' : 'dark'}
                          className="text-start py-2 px-3 border-0 small rounded-4"
                          style={{ fontSize: '12px' }}
                          onClick={() => {
                            setSelectedGalleryCodeKey(key);
                            setCopySuccess(false);
                          }}
                        >
                          {GALLERY_CODES[key].title}
                        </Button>
                      ))}
                    </div>
                  </Col>
                  
                  <Col md={9}>
                    <Card className="p-3 bg-dark border-secondary rounded-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-secondary">경로: <strong className="text-info">{GALLERY_CODES[selectedGalleryCodeKey].path}</strong></span>
                        <Button
                          size="sm"
                          variant="outline-info"
                          className="bubbly-btn"
                          style={{ fontSize: '11px' }}
                          onClick={() => {
                            navigator.clipboard.writeText(GALLERY_CODES[selectedGalleryCodeKey].code);
                            setCopySuccess(true);
                            setTimeout(() => setCopySuccess(false), 2000);
                          }}
                        >
                          {copySuccess ? '✔️ 복사 완료!' : '📋 코드 복사'}
                        </Button>
                      </div>
                      
                      <div className="code-viewer-container" style={{ maxHeight: '400px', background: '#090d16', border: '1px solid #1e293b' }}>
                        <pre className="m-0"><code style={{ fontSize: '11px', color: '#e2e8f0' }}>{GALLERY_CODES[selectedGalleryCodeKey].code}</code></pre>
                      </div>
                      
                      <div className="mt-3 text-secondary small">
                        <strong>파일 설명:</strong> {GALLERY_CODES[selectedGalleryCodeKey].description}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Card>
        </Col>

        {/* Right Side: AI Analytics Report & Mascot Profile */}
        <Col lg={5}>
          <Card className="glass-panel text-white border-0 p-4 h-100 d-flex flex-column">
            
            {/* Cute Mascot Profile Header */}
            <div className="mascot-container mb-4">
              <div className="mascot-avatar">🐻💪</div>
              <div className="speech-bubble">
                {getMascotCommentLocal()}
              </div>
            </div>

            <h4 className="fw-bold mb-3">🔮 AI Churn 상세 분석 보고서</h4>
            
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-50 my-auto">
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">AI 모델 연산 분석 중...</span>
              </div>
            ) : selectedMember && prediction ? (
              <div className="d-flex flex-column flex-grow-1">
                {/* Member Profile */}
                <div className="border-bottom border-secondary pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h3 className="fw-bold text-white mb-1">{selectedMember.name} 회원</h3>
                      <span className="text-secondary small">{selectedMember.gender} / {selectedMember.age}세 • {selectedMember.contractPeriod}개월권 이용 중</span>
                    </div>
                    <Badge className={`p-2 fs-6 bubbly-btn ${prediction.churnProbability >= 0.7 ? 'badge-critical-pulse' : prediction.churnProbability >= 0.4 ? 'bg-warning' : 'bg-success'}`}>
                      {prediction.riskLevel}
                    </Badge>
                  </div>
                </div>

                {/* Churn Probability Gage */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-secondary small fw-bold">예측된 이탈 확률</span>
                    <h3 className="fw-bold mb-0" style={{ color: prediction.churnProbability >= 0.7 ? '#f87171' : prediction.churnProbability >= 0.4 ? '#fbbf24' : '#34d399' }}>
                      {(prediction.churnProbability * 100).toFixed(1)}%
                    </h3>
                  </div>
                  <ProgressBar
                    now={prediction.churnProbability * 100}
                    variant={prediction.churnProbability >= 0.7 ? 'danger' : prediction.churnProbability >= 0.4 ? 'warning' : 'success'}
                    style={{ height: '12px' }}
                    className="bg-dark rounded-pill"
                  />
                </div>

                {/* Chart Segment */}
                <div className="mb-4 flex-grow-1" style={{ minHeight: '150px' }}>
                  <span className="text-secondary small fw-bold d-block mb-2">출석 트렌드 분석 (최근 4주)</span>
                  <div style={{ height: '140px' }}>
                    <Line
                      data={lineChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                          x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* AI Prescription Solution Box */}
                <div className={`p-3 rounded-4 border-start border-4 bg-dark mt-auto border-${getSolutionMessage(prediction.churnProbability).level}`}>
                  <h6 className="fw-bold mb-2">💡 AI 맞춤 행동 솔루션 제안</h6>
                  <p className="mb-0 text-light small" style={{ lineHeight: '1.6' }}>
                    {getSolutionMessage(prediction.churnProbability).text}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-secondary text-center my-auto">분석할 회원을 목록에서 클릭해 주세요.</p>
            )}

            {/* General Gym statistics breakdown at bottom */}
            <div className="mt-4 border-top border-secondary pt-3 d-flex align-items-center gap-3">
              <div style={{ width: '60px', height: '60px' }}>
                <Doughnut data={donutChartData} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <div>
                <span className="text-secondary small fw-bold d-block">체육관 전반적 건강 상태</span>
                <span className="small text-light">전체 회원 중 약 <strong>66.7%</strong>가 이탈 가능성이 낮은 안전 범주에 속해 있습니다.</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Footer / Tech spec info */}
      <footer className="mt-5 text-center text-secondary small border-top border-secondary pt-3">
        <p>Spring Boot 3.5 (Java 21) & React 18 & scikit-learn/ONNX Runtime embedded engine</p>
      </footer>
    </Container>
  );
}

export default App;
