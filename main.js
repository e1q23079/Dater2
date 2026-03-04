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

// 予定があるかどうかを判定
const isEvents = (date) => {
  return getGCalendar() ? getGCalendar().getEventsForDay(date).length > 0 : false;
}

// カレンダーのデータを生成
const getCalendar = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const calendar = [];
  let currentWeek = [];
  const firstDay = startDate.getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }
  for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
    currentWeek.push({
      date: new Date(date),
      status : isEvents(date) ? "ng" : "ok",
      url: `${getNowUrl()}?page=list&year=${date.getFullYear()}&month=${date.getMonth() + 1}&day=${date.getDate()}`
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
  // クエリパラメータからページを取得
  let page = e.parameter.page;

  // クエリパラメータから年、月、日を取得
  const param = e.parameter;
  let year = parseInt(param.year, 10);
  let month = parseInt(param.month, 10);
  let day = parseInt(param.day, 10);

  if(!page || page === "index") {
    // ページが指定されていない場合はindex.htmlを表示
    page = "index";
  }

  // ページが指定されていない場合はindex.htmlを表示
  const template = HtmlService.createTemplateFromFile(page);

  if(page === "index") {

    // 年、月、日が不正な場合は現在の年月日を使用
    if(isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      const today = new Date();
      year = today.getFullYear();
      month = today.getMonth() + 1;
    }

    // カレンダーのデータを生成
    template.calendar = getCalendar(year, month);

    // 前の月と次の月のURLを生成
    const prevDate = new Date(year, month - 2, 1);
    const nextDate = new Date(year, month, 1);
    template.prevUrl = `${getNowUrl()}?page=index&year=${prevDate.getFullYear()}&month=${prevDate.getMonth() + 1}`;
    template.nextUrl = `${getNowUrl()}?page=index&year=${nextDate.getFullYear()}&month=${nextDate.getMonth() + 1}`;
    
  }else if(page === "list") {

    // タイムテーブルのデータを生成
    template.timeTable = getTimeTable(year, month, day);

    // 前の日と次の日のURLを生成
    const prevDay = new Date(year, month - 1, day - 1);
    const nextDay = new Date(year, month - 1, day + 1);
    template.prevUrl = `${getNowUrl()}?page=list&year=${prevDay.getFullYear()}&month=${prevDay.getMonth() + 1}&day=${prevDay.getDate()}`;
    template.nextUrl = `${getNowUrl()}?page=list&year=${nextDay.getFullYear()}&month=${nextDay.getMonth() + 1}&day=${nextDay.getDate()}`;
  }

  // テンプレートに年、月、日を渡す
  template.year = year;
  template.month = month;
  template.day = day;
  template.url = getNowUrl();

  // カレンダーの名前をテンプレートに渡す
  template.calendarName = getGCalendar() ? getGCalendar().getName() : "カレンダーが見つかりません";

  // テンプレートを評価してHTMLを生成
  const html = template.evaluate();
  // タイトルとメタタグを設定
  html.setTitle(`Dater2 App - ${template.calendarName}`);
  html.addMetaTag("viewport", "width=device-width, initial-scale=1");
  return html;
}