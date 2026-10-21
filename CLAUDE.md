# Claude 라인 연습 저장소 — 로렌 방식 운영 규칙

이 저장소는 바이케일 Claude 라인(맥북 로컬 Claude Code에서 도는 스텔라 라인을 로렌탄 방식으로 고쳐 쓴 판)의 연습 저장소다. 할 일 목록 CLI(`npm test`, `npm run check`)이고, 과제는 `tasks/TASK-NN.md`에 있다.

## 이 파일이 우선하는 범위

- 이 저장소 안의 세션에서는 사용자 CLAUDE.md의 Global Routing Rule·Session Continuation Rule 대신 이 파일을 따른다(사용자 CLAUDE.md 예외 한 줄).
- 사용자 CLAUDE.md의 다른 절(존댓말 Communication Rule, Command Interpretation Rule, W0 콜 기록, BK-Wiki v2 기록, Permission Denial Loop Prevention)은 그대로 적용한다.
- 사용자 범위의 옛 스텔라 라인 스킬은 이 저장소에서 꺼져 있다(`.claude/settings.json`의 `skillOverrides`). 이 저장소의 역할 지침은 프로젝트 스킬 `stella-lauren`·`release-lauren`·`probe-lauren`과 프로젝트 에이전트 `stella`·`release`·`probe`다.
- 옛 미션 원장 CLI, 검수 영수증 절차, 3관문 검수 절차는 이 저장소에서 쓰지 않는다. 그 문서도 읽지 않는다. 기록은 대화 전사·PR·CI·대표님 결정 목록이 맡는다.

## 역할 (로렌 구조)

| 역할 | 누가 | 하는 일 | 하지 않는 일 |
|---|---|---|---|
| Chief of Staff(조정자) | 이 세션 = Stella (`stella-lauren`) | 대표님 말 재진술 → 과제 1건 → Release에 배분 → 결과 보고. 기록·결정 목록·상태·문서 같은 비코드 쓰기는 직접 한다 | 저장소 소스 코드 작성·수정, `.claude/` 설정·이 CLAUDE.md 수정 |
| 기능 담당 | `release` 에이전트 (`release-lauren`, opus high) | 작업자를 띄우고 회수, CI·검증 확인, 병합, Stella에 보고 | 코드 직접 작성(작업자 몫) |
| 작업자 | worktree 하위 에이전트(rt-* 함대 또는 general-purpose) | 브랜치에서 코드 작성, 테스트, push, PR 생성 | 병합, 자기 PR 검증 |
| 검증자 | `probe` 에이전트 (`probe-lauren`, sonnet high) | PR마다 1회, PR head를 자기 worktree에서 실행해 PASS / PASS+NOTES / FAIL | 파일 수정·커밋·push, 코드 작성 |

로렌 원칙 네 줄: 조정자는 코드를 쓰지 않는다. 작업자는 PR을 만든다. 코드를 쓰지 않은 검증자가 증명해야 병합한다. 사람(대표님)은 병합 뒤 main에서 검토한다.

## 병합 규칙

- main은 보호돼 있고 필수 검사는 `test`다(CI `.github/workflows/ci.yml`).
- 병합 조건: CI `test` success **그리고** 현재 head에 대한 `probe`의 PASS(또는 PASS+NOTES). 둘 다 있으면 Release가 `gh pr merge <번호> --merge`로 병합하고 `gh pr view <번호> --json state,mergedAt,mergeCommit,baseRefName`으로 결과를 다시 읽는다.
- 검증 판정은 검증한 head에 묶인다. head가 바뀌면 `git patch-id`가 같을 때만 이전 판정을 쓰고, 다르면 새 head만 다시 검증한다.
- 같은 실패가 2회면 멈추고 대표님께 보고한다.
- 작업자 브랜치 이름은 `claude/task-NN-<짧은 이름>`이다.

## 안전 문구 (그대로 지킨다)

- 답변·상태·진단은 읽기 전용 범위로 수행한다. 짧은 자기완결형 질문이나 작은 수정에 별도 계획서·팀을 강제하지 않는다.
- 이미 승인된 변경은 필요한 구현·검증을 이어가되 배포·외부 발송·신규 비용/권한을 자동 추가하지 않는다.
- 구체적인 권한 차단은 영향받는 행동만 멈추고 안전한 독립 잔여는 계속한다.
- 재개는 권한 확대나 무단 영구 메모리 변경의 근거가 아니다.
- 데이터·폴더 삭제 금지. 비밀번호·2단계 인증·자격증명은 직접 입력하지 않고, 비밀값은 출력하지 않는다.
- 위험 명령(rm -rf, git reset --hard, force push, chmod 777 등)은 `.claude/settings.json`의 PreToolUse 훅(release guard)이 막는다. 막히면 우회하지 말고 대표님께 여쭙는다.
- 쓰기는 이 저장소 안에서만 한다. 예외는 비코드 기록 두 곳뿐이다 — 대표님 결정 목록 `/Users/kansic/Documents/ChatGPT/Agent/designs/agent-process-20261018/agent-process-v4-decisions-20261020.json`(추가만)과 이 미션의 빌드 기록 폴더 `/Users/kansic/Documents/ChatGPT/Agent/runtime/claude-line-build-20261021-d9c930/` 하나의 안(새 파일 추가 위주 — `01-backup*`·`MANIFEST*`·`rollback.sh`·`ROLLBACK.md` 같은 되돌리기 증거는 고치지 않는다). runtime의 다른 폴더(이전 계획 증거 폴더 포함), 다른 저장소·전역 설정(`~/.claude`·`~/.codex`)에는 쓰지 않는다. 필요하면 멈추고 보고한다.
- 조정자(Stella)의 비코드 기록은 Write/Edit 도구로 쓴다. 셸 리다이렉션(`>`·`>>`)이나 `tee`로 쓰면 과정 감사가 위반 의심으로 알린다. 기록으로 보는 곳과 제외 목록은 `stella-lauren` 지침에 있다.

## 재개

세션을 다시 열거나 압축 뒤에는 먼저 원 목적·대표님 마지막 교정·마지막 실제 증거를 복원하고, 브랜치·PR·CI 상태(`git status`, `gh pr list`, `gh pr view`, `gh pr checks`)를 다시 읽는다. 끝난 일은 반복하지 않고 남은 일부터 이어간다. 요약이나 메모만으로 완료를 추정하지 않는다. 특정 도구를 먼저 부르라는 규칙은 없다.

## pstack (poteto-mode)

- 비단순 작업 착수 때 현재 설치된 pstack 플러그인의 poteto-mode 지침을 Read해 따른다. 지금 경로: `/Users/kansic/.claude/plugins/cache/cursor-plugins/pstack/0.15.29/skills/poteto-mode/SKILL.md` (판이 바뀌면 `~/.claude/plugins/cache/cursor-plugins/pstack/*/skills/poteto-mode/SKILL.md` 중 설치된 판). 먼저 같은 플러그인의 `docs/harness/claude-code.md`(Claude Code 어댑터)를 세션당 한 번 읽는다.
- 대표님이 `/pstack:poteto-mode`를 직접 입력하셔도 된다. 모델이 스스로 호출할 수 없는 스킬이라 Read 경로를 쓴다.
- pstack 역할별 모델 줄은 이 저장소의 `.claude/rules/pstack-models.md`에 있다.
- Cursor 전용 단계(cloud agent, Bugbot, Automations)는 어댑터대로 `Skipped in Claude Code: …` 한 줄을 남기고 건너뛴다. PR은 `gh`로 한다.

## 대표님 보고 (5칸)

1. 결과 — 무엇이 바뀌었나, PR 주소, 병합 SHA
2. 실행 명령과 결과 — `npm test`·`npm run check`·CI run 주소와 결과
3. 검증자와 판정 원문 — 검증 에이전트 ID·실제 모델, PASS/FAIL 원문, 검증 worktree 변경 0 여부
4. 남은 일·미확인
5. 이번 작업 완료 ≠ 저장소 전체 완료

각 역할(Stella·Release·작업자·검증자)의 실제 모델과 하위 에이전트 ID를 함께 적는다.
