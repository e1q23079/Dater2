// カレンダーIDを取得
const calendarId = PropertiesService.getScriptProperties().getProperty("CALENDAR_ID");
// カレンダーを取得
const calendar = CalendarApp.getCalendarById(calendarId);

// 現在のURLを取得
const getNowUrl = () => {
  const url = ScriptApp.getService().getUrl();
  return url;
}

// カレンダーにアクセスできるか確認
const isAccessCalendar = () => {
  if (!calendar) {
    return false;
  }
  return true;
}

// カレンダーを取得
const getGCalendar = () => {
  if (!calendar) {
    return null;
  }
  return calendar;
}

// カレンダーのデータを生成
const getCalendar = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const calendar = [];
  let currentWeek = [];
  let firstDay = startDate.getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }
  for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
    currentWeek.push({
      date: new Date(date),
      status : getGCalendar() ? (getGCalendar().getEventsForDay(date).length > 0 ? "ng" : "ok") : ""
    });
    if (currentWeek.length === 7) {
      calendar.push(currentWeek);
      currentWeek = [];
    }
  }
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push(null);
  }
  calendar.push(currentWeek);
  return calendar;
}

// タイムテーブル取得
const getTimeTable = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  const events = getGCalendar() ? getGCalendar().getEventsForDay(date) : [];
  const timeTable = [];
  for (let hour = 0; hour < 24; hour++) {
    timeTable[hour] = {hour: `${hour}:00~${hour + 1}:00`, status: "ok"};
  }
  events.forEach(event => {
    const startTime = event.getStartTime().getTime();
    const endTime = event.getEndTime().getTime();
    for(let hour = 0; hour < 24; hour++) {
      const slotStart = new Date(year, month - 1, day, hour).getTime();
      const slotEnd = new Date(year, month - 1, day, hour + 1).getTime();
      if (startTime < slotEnd && endTime > slotStart) {
        timeTable[hour].status = "ng";
      }
    }
  });
  return timeTable;
}

const doGet = (e) => {
  // クエリパラメータから年、月、日を取得
  const param = e.parameter;
  let year = parseInt(param.year, 10);
  let month = parseInt(param.month, 10);
  let day = parseInt(param.day, 10);
  // 年、月、日が不正な場合は現在の年月日を使用
  if(isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    const today = new Date();
    year = today.getFullYear();
    month = today.getMonth() + 1;
  }

  const template = HtmlService.createTemplateFromFile(day ? "list" : "index");

  template.calendar = getCalendar(year, month);
  
  template.year = year;
  template.month = month;
  template.day = day;

  template.prevUrl = `${getNowUrl()}?year=${month === 1 ? year - 1 : year}&month=${month === 1 ? 12 : month - 1}`;
  template.nextUrl = `${getNowUrl()}?year=${month === 12 ? year + 1 : year}&month=${month === 12 ? 1 : month + 1}`;
  
  template.calendarName = getGCalendar() ? getGCalendar().getName() : "カレンダーが見つかりません";

  template.timeTable = getTimeTable(year, month, day);

  const html = template.evaluate();
  html.setTitle(`Dater2 App - ${template.calendarName}`);
  html.addMetaTag("viewport", "width=device-width, initial-scale=1");
  return html;
}