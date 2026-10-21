// 완료한 할 일을 완료 날짜(doneOn, "YYYY-MM-DD" 문자열)별로 묶어 표시한다.
// 날짜는 문자열 그대로 묶고 정렬한다(Date로 바꾸지 않으므로 시간대와 무관하다).
import { formatTask } from "./todo.js";

const byId = (a, b) => a.id - b.id;

/**
 * 할 일 배열을 받아 출력할 줄의 배열을 돌려준다. 입력 배열과 항목은 바꾸지 않는다.
 * 완료 항목만 날짜 오름차순으로 묶고, doneOn 없는 완료 항목은 맨 뒤 "날짜 없음" 묶음에 둔다.
 */
export function formatReport(tasks) {
  const groups = new Map();
  const undated = [];
  for (const task of tasks) {
    if (task.done !== true) continue;
    if (typeof task.doneOn === "string") {
      if (!groups.has(task.doneOn)) groups.set(task.doneOn, []);
      groups.get(task.doneOn).push(task);
    } else {
      undated.push(task);
    }
  }
  if (groups.size === 0 && undated.length === 0) return ["(완료한 할 일 없음)"];

  const lines = [];
  const pushGroup = (title, items) => {
    lines.push(`${title} (${items.length}개)`);
    for (const task of items.sort(byId)) lines.push(`  ${formatTask(task)}`);
  };
  const dates = [...groups.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (const date of dates) pushGroup(date, groups.get(date));
  if (undated.length > 0) pushGroup("날짜 없음", undated);
  return lines;
}
