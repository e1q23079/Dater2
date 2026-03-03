// カレンダーIDを取得
const calendarId = PropertiesService.getScriptProperties().getProperty("CALENDAR_ID");

// 現在のURLを取得
const getNowUrl = () => {
  const url = ScriptApp.getService().getUrl();
  return url;
}

// カレンダーにアクセスできるか確認
const isAccessCalendar = () => {
  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    return false;
  }
  return true;
}

// カレンダーからイベントを取得
const getCalendarEvents = (year, month) => {
  const calendar = CalendarApp.getCalendarById(calendarId);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const events = calendar.getEvents(startDate, endDate);
  return events.map(event => ({
    title: event.getTitle(),
    startTime: event.getStartTime(),
    endTime: event.getEndTime()
  }));
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
    currentWeek.push(new Date(date));
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

const doGet = (e) => {
  // クエリパラメータから年、月、日を取得
  const param = e.parameter;
  let year = parseInt(param.year, 10);
  let month = parseInt(param.month, 10);
  // 年、月が不正な場合は現在の年月を使用
  if(isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    const today = new Date();
    year = today.getFullYear();
    month = today.getMonth() + 1;
  }

  const template = HtmlService.createTemplateFromFile("index");

  template.calendar = getCalendar(year, month);
  
  template.year = year;
  template.month = month;

  template.prevUrl = `${getNowUrl()}?year=${month === 1 ? year - 1 : year}&month=${month === 1 ? 12 : month - 1}`;
  template.nextUrl = `${getNowUrl()}?year=${month === 12 ? year + 1 : year}&month=${month === 12 ? 1 : month + 1}`;
  
  const html = template.evaluate();
  html.setTitle("Dater2 App");
  html.addMetaTag("viewport", "width=device-width, initial-scale=1");
  return html;
}