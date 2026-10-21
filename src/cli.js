#!/usr/bin/env node
// 명령줄 진입점. 사용법은 README.md의 "명령 사용법" 절을 본다.
import { pathToFileURL } from "node:url";
import { loadStore, saveStore } from "./storage.js";
import { addTask, listTasks, completeTask, removeTask, formatTask, clearCompleted } from "./todo.js";
import { formatReport } from "./report.js";

const USAGE = `사용법: node src/cli.js [--file <경로>] <명령> [인자]
명령:
  add <내용>     할 일 추가
  list           목록 출력
  done <번호> [--date YYYY-MM-DD]
                 완료 처리(완료 날짜 기록, --date 생략 시 오늘)
  remove <번호>  삭제
  clear-done     완료 항목 일괄 삭제
  report         완료 항목을 완료 날짜별로 묶어 출력
--file을 생략하면 현재 폴더의 todo.json을 쓴다.`;

/** 인자 배열을 { filePath, command, rest }로 나눈다. */
export function parseArgs(argv) {
  let filePath = "todo.json";
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--file") {
      if (i + 1 >= argv.length) throw new Error("--file 뒤에 경로가 필요합니다");
      filePath = argv[i + 1];
      i += 1;
    } else {
      positional.push(argv[i]);
    }
  }
  const [command, ...rest] = positional;
  return { filePath, command, rest };
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`번호는 1 이상의 정수여야 합니다: ${value}`);
  }
  return id;
}

function daysInMonth(year, month) {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** "YYYY-MM-DD"가 달력에 있는 날짜인지 확인해 그대로 돌려준다. 아니면 Error를 던진다. */
function parseDate(value) {
  const error = new Error(`--date 값은 YYYY-MM-DD 형식의 실제 날짜여야 합니다: ${value ?? "(값 없음)"}`);
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw error;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) throw error;
  return value;
}

/** 현지 시간대(TZ) 기준 오늘 날짜를 "YYYY-MM-DD"로 돌려준다. */
function todayLocal() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** done 명령의 나머지 인자에서 완료 날짜를 정한다. --date가 없으면 오늘. */
function parseDoneOn(rest) {
  const index = rest.indexOf("--date");
  if (index === -1) return todayLocal();
  return parseDate(rest[index + 1]);
}

/** 명령을 실행하고 출력할 문자열 배열을 돌려준다. 실패는 Error로 던진다. */
export function run(argv) {
  const { filePath, command, rest } = parseArgs(argv);
  const store = loadStore(filePath);
  switch (command) {
    case "add": {
      const task = addTask(store, rest.join(" "));
      saveStore(filePath, store);
      return [`추가: ${formatTask(task)}`];
    }
    case "list": {
      const tasks = listTasks(store);
      return tasks.length === 0 ? ["(할 일 없음)"] : tasks.map(formatTask);
    }
    case "done": {
      const id = parseId(rest[0]);
      const doneOn = parseDoneOn(rest);
      const task = completeTask(store, id, doneOn);
      saveStore(filePath, store);
      return [`완료: ${formatTask(task)}`];
    }
    case "remove": {
      const task = removeTask(store, parseId(rest[0]));
      saveStore(filePath, store);
      return [`삭제: ${formatTask(task)}`];
    }
    case "clear-done": {
      const removed = clearCompleted(store);
      saveStore(filePath, store);
      return [`완료 항목 ${removed}개 삭제`];
    }
    case "report":
      return formatReport(store.tasks);
    default:
      throw new Error(USAGE);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    for (const line of run(process.argv.slice(2))) console.log(line);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
