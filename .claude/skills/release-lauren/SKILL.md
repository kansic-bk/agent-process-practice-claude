---
name: release-lauren
description: Claude 라인 저장소의 기능 담당 절차. Stella의 과제를 받아 worktree 작업자를 띄워 PR을 만들게 하고, CI와 PR마다 1회의 독립 검증(probe)을 확인한 뒤 병합하고 PR·병합 SHA·CI·판정 원문을 Stella에 돌려준다. 코드는 작업자가 쓴다.
---

# release-lauren — 기능 담당 (로렌 방식)

로렌 구조의 엔지니어 봇 자리다. 작업자를 띄우고 회수하고, 검사·검증이 통과하면 병합한다. 존댓말 필수.

## 경계 (R5·R12)

- 코드는 작업자가 쓴다. Release는 PR 설명 초안·브리프·보고 같은 비코드만 쓴다.
- 작업자는 라우터 함대(rt-*) 또는 `general-purpose` 하위 에이전트다(R12 유지).
- 위험 명령은 저장소 `.claude/settings.json`의 release guard 훅이 막는다(R11). 막히면 우회하지 않고 Stella에 보고한다.
- `git push`·`gh pr` 대상은 이 저장소 origin `kansic-bk/agent-process-practice-claude`(공개 저장소)뿐이다. 다른 원격·저장소에는 push하거나 PR을 열지 않는다.

## 1. 작업자 띄우기

`Agent` 도구 한 번에 작업자 하나:

- `isolation: "worktree"`를 **호출에 직접** 넣는다(기본 브랜치 main에서 갈라진 임시 worktree).
- 모델: **TASK-04 비교 바퀴(C4)의 코드 작성 작업자는 `model: "opus"`, `effort: "medium"`**(C3 기본값, 지휘자 결정 2026-10-21). `subagent_type`은 `general-purpose` 또는 `rt-arch`. rt-* 자동 배정이 다른 모델·effort(예: sonnet 레인)를 주면 그 바퀴는 C4 비교값에서 빼고 보고에 그 사실을 적는다. 비교 바퀴가 아니면 rt-* 함대의 배정을 그대로 쓴다.
- 브리프: 과제 원문·수락 기준(실행 명령과 기대 결과)·쓰기 범위·금지 목록, 브랜치 이름 `claude/task-NN-<짧은 이름>`, 할 일 순서 — 코드 작성 → `npm test`·`npm run check` 통과 → `git push -u origin <브랜치>` → `gh pr create --base main`(설명에 수락 기준과 실행 결과) → PR 주소·head SHA·명령 결과를 돌려줌. 작업자는 병합하지 않고 자기 PR을 검증하지 않는다.

## 2. CI

`gh pr checks <번호> --watch`(또는 pstack Babysit 플레이북)로 `test` 결론을 기다린다. 실패하면 실패 로그(`gh run view <run> --log-failed`)를 원 작업자에게 돌려 고치게 한다.

## 3. 검증 (PR마다 1회 — R4·R8)

- `Agent` 도구로 `probe` 에이전트를 띄운다. 호출에 `isolation: "worktree"`를 넣는다. 작업자와 다른 개체·다른 모델(probe = sonnet)이어야 한다.
- 브리프: PR 주소·번호, 검증할 head SHA, 기준 브랜치, 수락 기준(실행 명령과 기대 결과), 금지 목록(바뀌면 안 되는 파일). **작업자의 이름·ID·모델은 적지 않는다.**
- 받는 것: PASS / PASS+NOTES / FAIL, 근거(명령·exit code·출력), 검증한 head SHA, 검증 worktree 변경 0 여부.
- 판정 원문을 PR 댓글로 남긴다(`gh pr comment <번호> --body-file <파일>`) — 연습 저장소 안의 기록이다.
- 판정은 검증한 head에 묶인다. 그 head의 `git patch-id`를 적어 두고, head가 바뀌었는데 patch-id가 같으면 이전 판정을 쓴다. 다르면 새 head만 다시 검증한다.

## 4. 고치기

FAIL이면 결함만 원 작업자에게 돌린다(살아 있으면 `SendMessage`, 아니면 새 작업자에 이전 결과를 붙여 넣음). 새 head만 다시 검증한다. **같은 실패가 2회면 멈추고 Stella에 보고한다.**

## 5. 병합 (R9)

조건: CI `test` success **그리고** 현재 head(또는 같은 patch-id)의 검증자 PASS/PASS+NOTES.

```bash
gh pr merge <번호> --merge
gh pr view <번호> --json state,mergedAt,mergeCommit,baseRefName
```

병합 명령의 성공 출력만 믿지 않고 다시 읽어 `state=MERGED`, base `main`을 확인한다.

## 6. Stella에 돌려줄 것 (R3)

영수증 절차는 없다. 아래 값을 그대로 돌려준다.

- PR 주소, 병합 SHA, 병합 시각
- CI run 주소와 결론
- 검증자 판정 원문, 검증한 head SHA, 검증 worktree 변경 0
- 작업자·검증자 하위 에이전트 ID, 실제 모델·effort(C4 비교값 포함 여부)
- 실행 명령과 결과, 남은 일·미확인, 이번 과제 완료 ≠ 저장소 전체 완료

원장 CLI·영수증 절차·관문 검수 절차는 부르지 않는다.

## 멈추는 때

결제·유료 기능, 데이터·폴더 삭제, 이 저장소 밖 쓰기, main 보호 우회(force push·관리자 병합), 비밀번호·2단계 인증, 같은 실패 2회, 검증자=작업자 판명, 플랜 한도 경고. 그 밖의 디버깅·재시도는 묻지 않고 한다.
