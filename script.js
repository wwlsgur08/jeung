// 자질 목록 배열
const traits = [
    '다정함', '성실함', '호기심', '침착함', '정직함', '유머 감각', '목표 의식',
    '책임감', '창의성', '안정감', '양심', '분위기 메이커', '공감 능력',
    '이해심', '배려심', '경청 능력', '위로 능력', '섬세함', '포용력',
    '인내심', '계획성', '세심함', '신중함', '절제력', '열린 마음', '모험심', '비판적 사고력',
    '통찰력', '넓은 시야', '집중력', '자기 성찰', '스트레스 대처', '현실 감각',
    '자기 객관화', '자존감', '일관성', '원칙 준수', '진정성', '약자보호',
    '다양한 친분', '타인을 편하게 해주는 능력', '연락 등 관계를 이어가는 능력', '사교적 에너지',
    '열정', '자기 계발 의지', '리더십', '야망', '경쟁심', '전략적 사고'
];

// 초기화 시 현재 선택된 자질 인덱스
let selectedTraitIndex = null;
// 현재 선택된 크기
let selectedSize = 0;

// 선 그리기 관련 변수
let drawMode = false; // 선 그리기 모드 상태
let startStar = null; // 선 그리기 시작 별
let lines = []; // 그려진 선들 저장 배열

// 별 크기 상태 저장 배열 (초기화 기능을 위해)
let starSizes = Array(49).fill(0);

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 별 그리드 생성
    createStarGrid();
    // 자질 목록 생성
    createTraitList();
    // 이벤트 리스너 설정
    setupEventListeners();
    // 검색 기능 설정
    setupSearch();
});

// 별 그리드 생성 함수
function createStarGrid() {
    const starGrid = document.getElementById('starGrid');
    
    for (let i = 0; i < 49; i++) {
        const starElement = document.createElement('div');
        starElement.className = 'star';
        starElement.dataset.index = i;
        starGrid.appendChild(starElement);
    }
}

// 자질 목록 생성 함수
function createTraitList() {
    const traitList = document.getElementById('traitList');
    
    traits.forEach((trait, index) => {
        const traitElement = document.createElement('div');
        traitElement.className = 'trait-item';
        traitElement.textContent = trait;
        traitElement.dataset.index = index;
        traitList.appendChild(traitElement);
    });
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
    // 자질 목록 클릭 이벤트
    const traitItems = document.querySelectorAll('.trait-item');
    traitItems.forEach(item => {
        item.addEventListener('click', () => {
            // 기존 선택 해제
            traitItems.forEach(t => t.classList.remove('selected'));
            // 새로운 선택
            item.classList.add('selected');
            
            // 선택된 자질 인덱스 저장
            selectedTraitIndex = parseInt(item.dataset.index);
        });
    });
    
    // 크기 버튼 클릭 이벤트 - 수정된 부분 (눌렀다 떼지는 효과)
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 자질이 선택되지 않은 경우 무시
            if (selectedTraitIndex === null) return;
            
            // 클릭 효과를 위한 클래스 추가 및 제거
            btn.classList.add('clicked');
            setTimeout(() => {
                btn.classList.remove('clicked');
            }, 600); // 물결 효과 애니메이션 시간과 일치
            
            // 선택된 크기 저장
            selectedSize = parseInt(btn.dataset.size);
            
            // 별 크기 배열에 저장
            starSizes[selectedTraitIndex] = selectedSize;
            
            // 별 크기 업데이트
            updateStarSize();
            
            // 클릭 소리 재생 (옵션)
            playClickSound();
        });
    });
    
    // 선 그리기 모드 버튼 이벤트
    const drawModeBtn = document.getElementById('drawModeBtn');
    drawModeBtn.addEventListener('click', () => {
        drawMode = !drawMode;
        if (drawMode) {
            drawModeBtn.textContent = '선 그리기 모드 끄기';
            drawModeBtn.classList.add('active');
        } else {
            drawModeBtn.textContent = '선 그리기 모드 켜기';
            drawModeBtn.classList.remove('active');
            startStar = null;
            // 선택 취소 시 강조 표시도 제거
            if (startStar) startStar.style.boxShadow = '';
        }
    });
    
    // 모든 선 지우기 버튼 이벤트
    const clearLinesBtn = document.getElementById('clearLinesBtn');
    clearLinesBtn.addEventListener('click', () => {
        clearAllLines();
    });
    
    // 별자리 초기화 버튼 이벤트 (별과 선 모두 초기화)
    const resetAllBtn = document.getElementById('resetAllBtn');
    resetAllBtn.addEventListener('click', () => {
        resetConstellation();
    });
    
    // 별 클릭 이벤트 (선 그리기용)
    setupStarConnectionEvents();
}

// 검색 기능 설정 함수
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    // 검색어 입력 이벤트
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filterTraits(searchTerm);
        
        // 지우기 버튼 표시 여부 결정
        if (searchTerm.length > 0) {
            clearSearchBtn.classList.add('visible');
        } else {
            clearSearchBtn.classList.remove('visible');
        }
    });
    
    // 검색어 지우기 버튼 이벤트
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterTraits('');
        clearSearchBtn.classList.remove('visible');
        searchInput.focus();
    });
    
    // ESC 키 누를 때 검색어 지우기
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            searchInput.value = '';
            filterTraits('');
            clearSearchBtn.classList.remove('visible');
            searchInput.blur();
        }
    });
}

// 자질 목록 필터링 함수
function filterTraits(searchTerm) {
    const traitItems = document.querySelectorAll('.trait-item');
    let matchFound = false;
    
    traitItems.forEach(item => {
        const traitText = item.textContent.toLowerCase();
        if (traitText.includes(searchTerm)) {
            item.classList.remove('hidden');
            matchFound = true;
        } else {
            item.classList.add('hidden');
        }
    });
    
    // 검색 결과가 없을 경우 메시지 표시 (옵션)
    const traitList = document.getElementById('traitList');
    const noResultsMsg = document.getElementById('noResultsMsg');
    
    if (!matchFound && searchTerm !== '') {
        if (!noResultsMsg) {
            const message = document.createElement('div');
            message.id = 'noResultsMsg';
            message.className = 'no-results';
            message.textContent = '검색 결과가 없습니다.';
            traitList.appendChild(message);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// 별 크기 및 투명도 업데이트 함수
function updateStarSize() {
    // 선택된 자질이 없으면 리턴
    if (selectedTraitIndex === null) return;
    
    // 해당 인덱스의 별 요소 찾기
    const star = document.querySelector(`.star[data-index="${selectedTraitIndex}"]`);
    
    // 모든 크기 클래스 제거
    for (let i = 1; i <= 6; i++) {
        star.classList.remove(`size-${i}`);
    }
    
    // 크기가 0이면 투명하게
    if (selectedSize === 0) {
        star.style.opacity = 0;
    } else {
        // 새 크기 클래스 추가 및 불투명하게
        star.classList.add(`size-${selectedSize}`);
        star.style.opacity = 1;
    }
}

// 별 연결 이벤트 설정 함수
function setupStarConnectionEvents() {
    const stars = document.querySelectorAll('.star');
    
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            // 선 그리기 모드일 때만 작동
            if (!drawMode) return;
            
            // 별이 투명한 상태면(선택되지 않은 자질) 무시
            if (parseFloat(star.style.opacity) === 0 || !star.style.opacity) return;
            
            // 시작 별이 없으면 현재 별을 시작점으로 설정
            if (!startStar) {
                startStar = star;
                // 시작 별 강조 표시
                startStar.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
            } else {
                // 자기 자신과 연결하려는 경우 무시
                if (startStar === star) {
                    startStar.style.boxShadow = '';
                    startStar = null;
                    return;
                }
                
                // 시작점과 현재 별 사이에 선 그리기
                drawLineBetweenStars(startStar, star);
                
                // 시작 별 초기화
                startStar.style.boxShadow = '';
                startStar = null;
            }
        });
    });
}

// 두 별 사이에 선 그리기 함수
function drawLineBetweenStars(star1, star2) {
    const svg = document.getElementById('connectionSvg');
    
    // 각 별의 중심 좌표 계산
    const rect1 = star1.getBoundingClientRect();
    const rect2 = star2.getBoundingClientRect();
    
    const svgRect = svg.getBoundingClientRect();
    
    const x1 = rect1.x + rect1.width / 2 - svgRect.x;
    const y1 = rect1.y + rect1.height / 2 - svgRect.y;
    const x2 = rect2.x + rect2.width / 2 - svgRect.x;
    const y2 = rect2.y + rect2.height / 2 - svgRect.y;
    
    // SVG 선 요소 생성
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.4)');
    line.setAttribute('stroke-width', '1.5');
    
    // 선을 SVG에 추가
    svg.appendChild(line);
    
    // 선 정보 저장 (삭제 기능 등을 위해)
    lines.push({
        element: line,
        star1Index: star1.dataset.index,
        star2Index: star2.dataset.index
    });
}

// 모든 선 지우기 함수
function clearAllLines() {
    const svg = document.getElementById('connectionSvg');
    
    // SVG 내의 모든 선 요소 제거
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    
    // 선 배열 초기화
    lines = [];
}

// 별자리 초기화 함수 (별과 선 모두 초기화)
function resetConstellation() {
    // 모든 선 지우기
    clearAllLines();
    
    // 모든 별 초기화
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        // 별 투명하게 만들기
        star.style.opacity = 0;
        
        // 크기 클래스 제거
        for (let i = 1; i <= 6; i++) {
            star.classList.remove(`size-${i}`);
        }
        
        // 강조 표시 제거
        star.style.boxShadow = '';
    });
    
    // 별 크기 상태 배열 초기화
    starSizes = Array(49).fill(0);
    
    // 자질 선택 초기화
    const traitItems = document.querySelectorAll('.trait-item');
    traitItems.forEach(item => {
        item.classList.remove('selected');
    });
    selectedTraitIndex = null;
    
    // 크기 버튼 선택 초기화
    selectedSize = 0;
    
    // 선 그리기 모드 초기화
    const drawModeBtn = document.getElementById('drawModeBtn');
    drawMode = false;
    drawModeBtn.textContent = '선 그리기 모드 켜기';
    drawModeBtn.classList.remove('active');
    startStar = null;
    
    // 검색창 초기화
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    filterTraits('');
    document.getElementById('clearSearchBtn').classList.remove('visible');
}

// 클릭 사운드 재생 함수 (옵션)
function playClickSound() {
    // 별도의 사운드 파일이 있다면 재생 가능
    // 웹 오디오 API 또는 Audio 객체 사용
    // 예: const clickSound = new Audio('click.mp3'); clickSound.play();
}

// 창 크기가 변경될 때 선 위치 재조정 (반응형을 위해)
window.addEventListener('resize', () => {
    // 기존 선들의 정보를 바탕으로 다시 그리기
    redrawAllLines();
});

// 모든 선 다시 그리기 함수
function redrawAllLines() {
    // 기존 선들의 정보 복사
    const oldLines = [...lines];
    
    // 모든 선 지우기
    clearAllLines();
    
    // 각 선에 대해 다시 그리기
    oldLines.forEach(line => {
        const star1 = document.querySelector(`.star[data-index="${line.star1Index}"]`);
        const star2 = document.querySelector(`.star[data-index="${line.star2Index}"]`);
        
        // 두 별이 모두 존재하면 선 다시 그리기
        if (star1 && star2) {
            drawLineBetweenStars(star1, star2);
        }
    });
}