document.addEventListener('DOMContentLoaded', function () {


  const rcwAvailableLang = ['ka', 'en']

  let rcwLang = document.documentElement.lang || 'ka';

  if (!rcwAvailableLang.includes(rcwLang)) {
    rcwLang = 'ka';
  }

  const rcwUrlGet = "https://citynet.ge/b2b/rcw/get_schedule.php";
  const rcwUrlSet = "https://citynet.ge/b2b/rcw/request_call.php";
  const rcwUrlKey = "https://citynet.ge/b2b/rcw/get_api_key.php";

  let rcwWidgetApiKey = '';

  let rcwDatesInit = [];
  let rcwDates = [];
  let rcwCallMode = 0;
  let rcwTimeInSecondsTotal = 60000;
  let rcwTimeInSeconds = 0;
  let rcwTimerInterval;
  const rcwTimeInterval = 15;

  function updateRcwLangTextContent() {
    const elementsToTranslate = document.querySelectorAll('[data-rcw-translation-key]');

    elementsToTranslate.forEach(function (element) {
      const translationKey = element.getAttribute('data-rcw-translation-key');
      element.textContent = rcwLangData[rcwLang][translationKey];
    });
  }

  const handleRcwLangAttributeChange = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
        rcwLang = mutation.target.lang;
        if (!rcwAvailableLang.includes(rcwLang)) {
          rcwLang = 'ka';
        }
        updateRcwLangTextContent();
      }
    }
  };

  const observer = new MutationObserver(handleRcwLangAttributeChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  const rcwLangData = {
    ka: {
      waiting_call: "ველოდები ზარს!",
      choose_time: "აირჩიეთ დაკავშირების სასურველი დრო",
      call_now: "დამიკავშირდით ახლავე",
      number_incorrect: "ნომერი არასწორად არის მითითებული",
      callback: "გნებავთ ჩვენ გადმოგირეკავთ?",
      call_one_min: "მიუთითეთ თქვენი ნომერი და ჩვენ დაგიკავშირდებით 1 წუთის განმავლობაში!",
      work_time_over: "სამუშაო საათები დასრულებულია",
      weekend: "დღეს ვისვენებთ",
      selected_time: "დაგიკავშირდებით შერჩეულ დროს",
      break: "შესვენება",
      from: "-დან",
      to: "-მდე",
      not_work_time: "ახლა არასამუშაო დროა",
      today: "დღეს",
      tomorrow: "ხვალ",
      valid_date: "მიუთითეთ ვალიდური თარიღი",
      valid_time: "მიუთითეთ ვალიდური დრო",
      contact_manager: "გაკავშირებთ მენეჯერს...",
      thanks: "მადლობა",
      contact_you_time: "ჩვენ დაგიკავშირდებით! დრო:",
      call_back_soon: "უკაცრავად, მალე დაგიკავშირდებით!",
    },
    en: {
      waiting_call: "I am Waiting for a call!",
      choose_time: "Select the desired connection time",
      call_now: "Contact me now",
      number_incorrect: "The number is incorrect!",
      callback: "Do you want us to call you back?",
      call_one_min: "Enter your number and we will contact you within 1 minute!",
      work_time_over: "Working hours are over.",
      weekend: "Today we are resting.",
      selected_time: "We will contact you at the selected time",
      break: "Break from",
      from: " to",
      to: "",
      not_work_time: "Now it's non-working time.",
      today: "Today",
      tomorrow: "Tomorrow",
      valid_date: "Enter a valid date!",
      valid_time: "Specify a valid time!",
      contact_manager: "Please wait, I will connect you to the manager...",
      thanks: "thanks",
      contact_you_time: "We will contact you! Time:",
      call_back_soon: "Sorry, I'll call you back soon!",
    }
  }

  const rcwContainer = document.createElement('div');

  rcwContainer.id = 'rcw-container';
  document.body.appendChild(rcwContainer);

  const rcwTimerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="#fff"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M360 0H24C10.7 0 0 10.7 0 24v16c0 13.3 10.7 24 24 24 0 91 51 167.7 120.8 192C75 280.3 24 357 24 448c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24v-16c0-13.3-10.7-24-24-24 0-91-51-167.7-120.8-192C309 231.7 360 155 360 64c13.3 0 24-10.7 24-24V24c0-13.3-10.7-24-24-24zm-64 448H88c0-77.5 46.2-144 104-144 57.8 0 104 66.5 104 144z"/></svg>`;
  const rcwTimerEndPhone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="#fff"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M97.3 507c-129.9-129.9-129.7-340.3 0-469.9 5.7-5.7 14.5-6.6 21.3-2.4l64.8 40.5a17.2 17.2 0 0 1 6.8 21l-32.4 81a17.2 17.2 0 0 1 -17.7 10.7l-55.8-5.6c-21.1 58.3-20.6 122.5 0 179.5l55.8-5.6a17.2 17.2 0 0 1 17.7 10.7l32.4 81a17.2 17.2 0 0 1 -6.8 21l-64.8 40.5a17.2 17.2 0 0 1 -21.3-2.4zM247.1 95.5c11.8 20 11.8 45 0 65.1-4 6.7-13.1 8-18.7 2.6l-6-5.7c-3.9-3.7-4.8-9.6-2.3-14.4a32.1 32.1 0 0 0 0-29.9c-2.5-4.8-1.7-10.7 2.3-14.4l6-5.7c5.6-5.4 14.8-4.1 18.7 2.6zm91.8-91.2c60.1 71.6 60.1 175.9 0 247.4-4.5 5.3-12.5 5.7-17.6 .9l-5.8-5.6c-4.6-4.4-5-11.5-.9-16.4 49.7-59.5 49.6-145.9 0-205.4-4-4.9-3.6-12 .9-16.4l5.8-5.6c5-4.8 13.1-4.4 17.6 .9zm-46 44.9c36.1 46.3 36.1 111.1 0 157.5-4.4 5.6-12.7 6.3-17.9 1.3l-5.8-5.6c-4.4-4.2-5-11.1-1.3-15.9 26.5-34.6 26.5-82.6 0-117.1-3.7-4.8-3.1-11.7 1.3-15.9l5.8-5.6c5.2-4.9 13.5-4.3 17.9 1.3z"/></svg>`;

  rcwContainer.innerHTML = `
        <div id="rcw-phone" class="rcw-phone">
          <div class="rcw-phone-content">
            <div class="rcw-circle"></div>
            <div class="rcw-circle-fill"></div>
            <div class="rcw-img-circle">
            <div style="width: 30px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff">
                <path d="M21.384,17.752a2.108,2.108,0,0,1-.522,3.359,7.543,7.543,0,0,1-5.476.642C10.5,20.523,3.477,13.5,2.247,8.614a7.543,7.543,0,0,1,.642-5.476,2.108,2.108,0,0,1,3.359-.522L8.333,4.7a2.094,2.094,0,0,1,.445,2.328A3.877,3.877,0,0,1,8,8.2c-2.384,2.384,5.417,10.185,7.8,7.8a3.877,3.877,0,0,1,1.173-.781,2.092,2.092,0,0,1,2.328.445Z"/>
              </svg>
            </div>
            </div>
          </div>
        </div>

        <div id="rcw-modal" class="rcw-modal">
          <div class="rcw-modal-content">
            <div class="rcw-modal-header">
              <span class="rcw-close">&times;</span>
              <h2 style="display:none;">&nbsp;</h2>
            </div>
            <div class="rcw-modal-body" id="rcw-modal-body">
              <div id="rcw-modal-body-call">
                <div style="text-align: center;">
                  <p class="rcw-body-title"></p>
                  <p class="rcw-body-title-sub"></p>
                </div>
                <div>
                  <div>
                    <div class="rcw-row">
                      <div class="rcw-input-group rcw-prefix">
                        <span class="rcw-input-group-addon">
                          <svg style="width: 40px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 5 36 26">
                            <path fill="#EEE" d="M32 5H20.5v10.5H36V9c0-2.209-1.791-4-4-4z" />
                            <path fill="#E8112D" d="M20.5 5h-5v10.5H0v5h15.5V31h5V20.5H36v-5H20.5z" />
                            <path fill="#E8112D" d="M28.915 9.585c.031-.623.104-1.244.221-1.86-.588.073-1.183.073-1.77 0 .117.615.19 1.237.221 1.86-.623-.031-1.244-.104-1.86-.221.073.588.073 1.183 0 1.77.615-.117 1.237-.19 1.86-.221-.031.623-.104 1.244-.221 1.86.588-.073 1.183-.073 1.77 0-.117-.615-.19-1.237-.221-1.86.623.031 1.244.104 1.86.221-.073-.588-.073-1.183 0-1.77-.616.118-1.237.191-1.86.221z" />
                            <path fill="#EEE" d="M15.5 5H4C1.791 5 0 6.791 0 9v6.5h15.5V5z" />
                            <path fill="#E8112D" d="M8.415 9.585c.031-.623.104-1.244.221-1.86-.588.073-1.183.073-1.77 0 .117.615.19 1.237.221 1.86-.623-.031-1.244-.104-1.86-.221.073.588.073 1.183 0 1.77.615-.117 1.237-.19 1.86-.221-.031.623-.104 1.244-.221 1.86.588-.073 1.183-.073 1.77 0-.117-.615-.19-1.237-.221-1.86.623.031 1.244.104 1.86.221-.073-.588-.073-1.183 0-1.77-.616.118-1.237.191-1.86.221z" />
                            <path fill="#EEE" d="M36 27v-6.5H20.5V31H32c2.209 0 4-1.791 4-4z" />
                            <path fill="#E8112D" d="M28.915 26.415c.031.623.104 1.244.221 1.86-.588-.073-1.183-.073-1.77 0 .117-.615.19-1.237.221-1.86-.623.031-1.244.104-1.86.221.073-.588.073-1.183 0-1.77.615.117 1.237.19 1.86.221-.031-.623-.104-1.244-.221-1.86.588.073 1.183.073 1.77 0-.117.615-.19 1.237-.221 1.86.623-.031 1.244-.104 1.86-.221-.073.588-.073 1.183 0 1.77-.616-.118-1.237-.191-1.86-.221z" />
                            <path fill="#EEE" d="M15.5 20.5H0V27c0 2.209 1.791 4 4 4h11.5V20.5z" />
                            <path fill="#E8112D" d="M8.415 26.415c.031.623.104 1.244.221 1.86-.588-.073-1.183-.073-1.77 0 .117-.615.19-1.237.221-1.86-.623.031-1.244.104-1.86.221.073-.588.073-1.183 0-1.77.615.117 1.237.19 1.86.221-.031-.623-.104-1.244-.221-1.86.588.073 1.183.073 1.77 0-.117.615-.19 1.237-.221 1.86.623-.031 1.244-.104 1.86-.221-.073.588-.073 1.183 0 1.77-.616-.118-1.237-.191-1.86-.221z" />
                          </svg>
                        </span>
                        <input type="number" placeholder="5xx xx xx xx" name="rcw_input_mobile" class="rcw-input" id="rcw-input">
                      </div>
                      <div class="rcw-error-message" id="rcw-error-message"></div>
                    </div>
                  </div>
                  <div class="rcw-select-call-date" id="rcw-select-call-date" style="margin: 10px 0;">
                    <div>
                      <select name="rcw_day_pick" id="rcw-day-pick">
                      </select>
                    </div>
                    <div>
                      <select name="rcw_time_pick" id="rcw-time-pick">
                      </select>
                    </div>
                  </div>
                  <div class="rcw-keypad" id="rcw-keypad">
                    <div class="rcw-key">1</div>
                    <div class="rcw-key">2</div>
                    <div class="rcw-key">3</div>
                    <div class="rcw-key">4</div>
                    <div class="rcw-key">5</div>
                    <div class="rcw-key">6</div>
                    <div class="rcw-key">7</div>
                    <div class="rcw-key">8</div>
                    <div class="rcw-key">9</div>
                    <div class="rcw-key">0</div>
                    <div class="rcw-key">←</div>
                    <div class="rcw-key">x</div>
                  </div>
                  <div class="rcw-error-message" id="rcw-error-message-date"></div>
                  <div style="margin: 10px 0;">
                    <button class="rcw-button" id="rcw-button-submit" style="width: 100%;" data-rcw-translation-key="waiting_call">${rcwLangData[rcwLang].waiting_call}</button>
                  </div>
                  <div class="rcw-choose-date" style="text-align: center;margin: 10px 0;text-decoration: underline; cursor: pointer;"
                  data-rcw-translation-key="choose_time"
                  >
                    ${rcwLangData[rcwLang].choose_time}
                  </div>
                  <div class="rcw-choose-date-now" style="display: none; text-align: center;margin: 10px 0;text-decoration: underline; cursor: pointer;"
                  data-rcw-translation-key="call_now"
                  >
                    ${rcwLangData[rcwLang].call_now}
                  </div>
                </div>
              </div>
              <div id="rcw-modal-body-result">
              </div>
            </div>
            <div class="rcw-modal-footer">
              <div style="text-align: center;"><a href="https://citynet.ge/ka/biznesistvis" target="_blank">Powered by Citynet</a></div>
            </div>
          </div>
        </div>
    `;




  const rcwModalBody = document.getElementById('rcw-modal-body');
  const rcwModalBodyCall = document.getElementById('rcw-modal-body-call');
  const rcwModalBodyResult = document.getElementById('rcw-modal-body-result');

  const rcwInputField = document.getElementById('rcw-input');

  const rcwCD = document.getElementsByClassName("rcw-choose-date")[0]
  const rcwCDN = document.getElementsByClassName("rcw-choose-date-now")[0]
  const rcwSCD = document.getElementsByClassName("rcw-select-call-date")[0]

  const modal = document.getElementById("rcw-modal");

  const rcwPhone = document.getElementById("rcw-phone");
  const rcwButtonSubmit = document.getElementById("rcw-button-submit");

  const rcwClose = document.getElementsByClassName("rcw-close")[0];

  const rcwBodyTitle = document.getElementsByClassName("rcw-body-title")[0];
  const rcwBodyTitleSub = document.getElementsByClassName("rcw-body-title-sub")[0];


  const rcwGetApiKey = async () => {
    const formData = new FormData();

    formData.append("site", window.location.origin);

    const url = `${rcwUrlKey}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      //console.log('შეცდომა');
      return;
    }

    try {
      const data = await response.text();

      rcwWidgetApiKey = data;

      if (rcwWidgetApiKey?.length > 0) {
        rcwPhone.style.display = "block";
      }

    } catch (error) {
      /* console.log('error');
      console.log(error); */
    }
  }

  rcwGetApiKey();

  rcwPhone.onclick = function () {
    rcwCDN.click();
    rcwModalBody.classList.remove('result-body');
    modal.style.display = "block";
    rcwModalBodyCall.style.display = "block";
    rcwModalBodyResult.style.display = "none";

    document.getElementById('rcw-error-message-date').textContent = "";

    rcwSetTitle(1);

    rcwButtonSubmit.removeAttribute('disabled');
    rcwButtonSubmit.classList.remove('loading');

    if (rcwWidgetApiKey) {
      getRcwData();
    }
  }

  rcwClose.onclick = function () {
    modal.style.display = "none";
    rcwInputField.value = '';
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      rcwInputField.value = '';
    }
  }


  rcwCD.onclick = function () {

    rcwDates = rcwFilterDates(rcwDatesInit);

    rcwFiltersAll();

    rcwDates = rcwFilterEmptyHours(rcwDates);

    document.getElementById("rcw-day-pick").classList.remove('rcw-error-select-message');
    document.getElementById("rcw-time-pick").classList.remove('rcw-error-select-message');

    const initialDate = rcwDates[0]?.value;
    updateSelectOptions("rcw-day-pick", rcwDates.map(day => ({
      value: day.value,
      label: day.date
    })));
    updateSelectOptions("rcw-time-pick", getWorkingHours(initialDate));

    rcwSCD.style.setProperty('display', 'flex');
    rcwCD.style.setProperty('display', 'none');
    rcwCDN.style.setProperty('display', 'block');
    rcwCallMode = 1;
  }

  rcwCDN.onclick = function () {
    rcwSCD.style.removeProperty('display');
    rcwCDN.style.setProperty('display', 'none');
    rcwCD.style.setProperty('display', 'block');
    rcwCallMode = 0;
  }


  //keypad
  const keypad = document.getElementById('rcw-keypad');

  keypad.addEventListener('click', function (event) {
    const clickedElement = event.target;
    if (clickedElement.classList.contains('rcw-key')) {
      const inputValue = rcwInputField.value;
      const clickedValue = clickedElement.innerText;

      if (clickedValue === '←') {
        rcwInputField.value = inputValue.slice(0, -1);
      } else if (clickedValue === 'x') {
        rcwInputField.value = '';
      } else {
        rcwInputField.value = inputValue + clickedValue;
      }

      validateRcwPhoneNumber();
    }
  });


  rcwInputField.addEventListener('input', function () {
    validateRcwPhoneNumber();
  });

  rcwButtonSubmit.addEventListener('click', function (event) {
    if (validateRcwPhoneNumber()) {
      sendRcwData();
    } else {
      //console.log('err');
    }
  });

  const validateRcwPhoneNumber = () => {
    const errorMessage = document.getElementById('rcw-error-message');
    const phoneNumberRegex = /^\+?(995)?0?(5\d{8}|(32)?2\d{6}|7\d{8}|(3|4)\d{2}\d{6})$/;

    if (phoneNumberRegex.test(rcwInputField.value)) {
      errorMessage.textContent = '';
      return true;
    } else {
      errorMessage.textContent = rcwLangData[rcwLang].number_incorrect;
      return false;
    }
  }

  const getRcwData = async () => {
    const formData = new FormData();

    formData.append("apikey", rcwWidgetApiKey);
    formData.append("site", window.location.origin);

    const url = `${rcwUrlGet}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      //console.log('შეცდომა');
      return;
    }

    try {
      const data = await response.json();

      rcwDatesInit = data;
      rcwDates = rcwFilterDates(rcwDatesInit);

      rcwFiltersAll();

    } catch (error) {
      //console.log('error');
      //console.log(error);
    }
  }

  const rcwSetTitle = (title, times = []) => {
    if (title == 1) {
      rcwBodyTitle.innerHTML = rcwLangData[rcwLang].callback;
      rcwBodyTitleSub.innerHTML = rcwLangData[rcwLang].call_one_min;
    } else if (title == 2) {
      rcwBodyTitle.innerHTML = rcwLangData[rcwLang].work_time_over;
      rcwBodyTitleSub.innerHTML = rcwLangData[rcwLang].selected_time;
    } else if (title == 3) {
      rcwBodyTitle.innerHTML = rcwLangData[rcwLang].weekend;
      rcwBodyTitleSub.innerHTML = rcwLangData[rcwLang].selected_time;
    } else if (title == 4) {
      rcwBodyTitle.innerHTML = `${rcwLangData[rcwLang].break} ${times[0]}${rcwLangData[rcwLang].from} ${times[1]}${rcwLangData[rcwLang].to}`;
      rcwBodyTitleSub.innerHTML = rcwLangData[rcwLang].selected_time;
    } else if (title == 5) {
      rcwBodyTitle.innerHTML = rcwLangData[rcwLang].not_work_time;
      rcwBodyTitleSub.innerHTML = rcwLangData[rcwLang].selected_time;
    }
  }

  const rcwFiltersAll = () => {
    const currentDateAvailable = rcwDates.some(data => data.value === rcwGetFormattedDateTime().substring(0, 10));
    const currentDateTimeAvailable = rcwDates[0]?.working_hours.length > 0;

    if (!currentDateAvailable || !currentDateTimeAvailable) {
      if (!currentDateTimeAvailable) {
        rcwSetTitle(2);
      } else {
        rcwSetTitle(3);
      }

      rcwCD.click();
      rcwCDN.style.setProperty('display', 'none');
      return;
    }

    const currenTimeAvailable = isCurrentTimeAvailable(rcwDates);
    const currentTime = new Date().getTime();

    if (rcwDates[0].break_start != undefined && rcwDates.break_end != undefined) {
      if (!currenTimeAvailable && rcwDates[0].break_start <= currentTime && currentTime <= rcwDates[0].break_end) {
        rcwSetTitle(4, [rcwDates[0].break_start.substring(0, 5), rcwDates[0].break_end.substring(0, 5)]);

        rcwCD.click();
        rcwCDN.style.setProperty('display', 'none');
      }
    } else {
      if (!currenTimeAvailable) {
        rcwSetTitle(5);

        rcwCD.click();
        rcwCDN.style.setProperty('display', 'none');
      }
    }

  }

  const rcwFilterDates = (dates) => {
    return Object.values(dates).map(dayData => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentDate = new Date().getDate();
      const currentDayOfWeek = new Date().getDay();

      const weekDayId = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;

      let daysUntilWeekDay = dayData.week_day_id - weekDayId;
      if (daysUntilWeekDay < 0) {
        daysUntilWeekDay += 7;
      }

      const startDate = new Date(currentYear, currentMonth - 1, currentDate + daysUntilWeekDay);
      let formattedDate = `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const formattedFullDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;

      let today = new Date();
      let tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (startDate.toDateString() === today.toDateString()) {
        formattedDate = rcwLangData[rcwLang].today;
      } else if (startDate.toDateString() === tomorrow.toDateString()) {
        formattedDate = rcwLangData[rcwLang].tomorrow;
      }

      return {
        ...dayData,
        date: formattedDate,
        value: formattedFullDate,
        working_hours: generateWorkingHours(dayData)
      };
    }).sort((a, b) => {
      const dateA = new Date(a.value);
      const dateB = new Date(b.value);

      return dateA - dateB;
    });

  }

  const rcwFilterEmptyHours = (dates) => {
    return dates.filter(date => date.working_hours.length > 0)
  }

  const sendRcwData = async () => {
    let time = '';

    if (rcwCallMode == 0) {
      time = rcwGetFormattedDateTime(new Date());
    } else {
      const dayPick = document.getElementById("rcw-day-pick").value;
      const timePick = document.getElementById("rcw-time-pick").value;
      time = rcwGetFormattedDateTime(`${dayPick} ${timePick}:00`);
    }
    const formData = new FormData();

    formData.append("apikey", rcwWidgetApiKey);
    formData.append("phone", rcwInputField.value);
    formData.append("time", time);
    formData.append("site", window.location.origin);

    if (rcwCallMode == 0) {
      formData.append("immediately", 1);
    }

    const url = `${rcwUrlSet}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      //console.log('შეცდომა');
      return;
    }

    try {
      const data = await response.json();

      if (data.result == 'success' || data.error == 'exists') {
        rcwModalBodyCall.style.display = "none";
        rcwModalBodyResult.style.display = "block";
        rcwRenderResult(time.replace('T', ' '));
      }

      if (data.error == "passed date") {
        const errorMessage = document.getElementById('rcw-error-message-date');
        document.getElementById("rcw-day-pick").classList.add('rcw-error-select-message');
        errorMessage.textContent = rcwLangData[rcwLang].valid_date;
      }

      if (data.error == "passed time") {
        const errorMessage = document.getElementById('rcw-error-message-date');
        document.getElementById("rcw-time-pick").classList.add('rcw-error-select-message');
        errorMessage.textContent = rcwLangData[rcwLang].valid_time;
      }

      if (data.error == "spam") {
        /* rcwButtonSubmit.setAttribute('disabled', 'true');
        rcwButtonSubmit.classList.add('loading'); */

        rcwModalBodyResult.innerHTML = '<div class="rcw-loading"></div>';
        rcwModalBodyCall.style.display = "none";
        rcwModalBodyResult.style.display = "block";
      }

    } catch (error) {
      //console.log('error');
      //console.log(error);
    }

  }

  function isCurrentTimeAvailable(times) {
    const currentDateTime = new Date();

    for (const time of times) {
      const workStart = new Date(time.value + ' ' + time.work_start);
      const workEnd = new Date(time.value + ' ' + time.work_end);

      if (currentDateTime >= workStart && currentDateTime <= workEnd) {
        if (time.break_start !== null && time.break_end !== null) {
          const breakStart = new Date(time.value + ' ' + time.break_start);
          const breakEnd = new Date(time.value + ' ' + time.break_end);

          if (currentDateTime < breakStart || currentDateTime > breakEnd) {
            return true;
          }
        } else {
          return true;
        }
      }
    }

    return false;
  }

  function rcwGetFormattedDateTime(dateParam = new Date(), secondsToAdd = 0) {
    let currentDate = new Date(dateParam);

    // Add seconds to the current date
    currentDate.setSeconds(currentDate.getSeconds() + secondsToAdd);

    let year = currentDate.getFullYear();
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    let day = currentDate.getDate().toString().padStart(2, '0');

    let hours = currentDate.getHours().toString().padStart(2, '0');
    let minutes = currentDate.getMinutes().toString().padStart(2, '0');
    let seconds = currentDate.getSeconds().toString().padStart(2, '0');

    let formattedDateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;

    return formattedDateTime;
  }

  function parseDateTime(dateTimeString) {
    const [date, time] = dateTimeString.split('T');
    const [year, month, day] = date.split('-');
    const [hours, minutes, seconds] = time.split(':');
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }


  const generateWorkingHours = (dayData) => {
    const result = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDayOfWeek = (new Date().getDay() + 6) % 7 + 1;

    const weekDayId = parseInt(dayData.week_day_id, 10);

    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    const startTime = parseDateTime(`${currentYear}-${currentMonth}-${currentDayOfWeek}T${dayData.work_start}`);
    const endTime = parseDateTime(`${currentYear}-${currentMonth}-${currentDayOfWeek}T${dayData.work_end}`);
    const breakStart = dayData.break_start ? parseDateTime(`${currentYear}-${currentMonth}-${currentDayOfWeek}T${dayData.break_start}`) : null;
    const breakEnd = dayData.break_end ? parseDateTime(`${currentYear}-${currentMonth}-${currentDayOfWeek}T${dayData.break_end}`) : null;

    let currentWorkingHour = new Date(startTime);

    if (currentDayOfWeek === weekDayId && currentHour > currentWorkingHour.getHours()) {
      currentWorkingHour.setHours(currentHour, Math.ceil(currentMinute / rcwTimeInterval) * rcwTimeInterval, 0);
    }

    while (currentWorkingHour < endTime) {
      if (!(breakStart && currentWorkingHour >= breakStart && currentWorkingHour <= breakEnd)) {
        if (currentWorkingHour > startTime) {
          const label = currentWorkingHour.toLocaleTimeString('ka-GE', { hour12: false }).slice(0, 5);

          if (!(currentDayOfWeek === weekDayId && currentWorkingHour.getMinutes() === currentMinute)) {
            result.push({
              value: label,
              label: label,
            });
          }
        }
      }
      currentWorkingHour.setMinutes(currentWorkingHour.getMinutes() + rcwTimeInterval);
    }

    return result;
  };

  function rcwRenderResult(time) {

    rcwModalBody.classList.add('result-body');

    let resultData = '';

    if (rcwCallMode == 0) {
      resultData = `<div style="text-align: center;">
                    <h3>${rcwLangData[rcwLang].contact_manager}</h3>
                    <div style="display: inline-block; margin-top: 40px;">
                      <div style="display: inline-block; width: 60px;margin-right: 30px;">${rcwTimerSvg}</div>
                      <div style="display: inline-block; vertical-align: sub;"><h2 id="rcw-timer"></h2></div>
                    </div>
                  </div>`;

      clearInterval(rcwTimerInterval);
      rcwTimeInSeconds = rcwTimeInSecondsTotal;
      updateRcwTimer();
      rcwTimerInterval = setInterval(updateRcwTimer, 100);
    } else {
      resultData = `<div style="text-align: center;">
                      <h2>${rcwLangData[rcwLang].thanks}</h2>
                      <h4>${rcwLangData[rcwLang].contact_you_time} ${time}</h4>
                    </div>`;
    }

    rcwModalBodyResult.innerHTML = resultData;
  }

  function updateSelectOptions(selectId, options) {
    const selectElement = document.getElementById(selectId);
    selectElement.innerHTML = "";
    options.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      selectElement.appendChild(optionElement);
    });
  }

  function getWorkingHours(selectedDate) {
    const selectedDay = rcwDates.find(day => day.value === selectedDate);
    return selectedDay ? selectedDay.working_hours : [];
  }

  function handleDateSelectionChange() {
    document.getElementById('rcw-error-message-date').textContent = "";
    document.getElementById("rcw-day-pick").classList.remove('rcw-error-select-message');
    const selectedDate = document.getElementById("rcw-day-pick").value;
    const workingHours = getWorkingHours(selectedDate);
    updateSelectOptions("rcw-time-pick", workingHours);
  }

  function handleTimeSelectionChange() {
    document.getElementById('rcw-error-message-date').textContent = "";
    document.getElementById("rcw-time-pick").classList.remove('rcw-error-select-message');
  }

  function updateRcwTimer() {

    const seconds = Math.floor(rcwTimeInSeconds / 1000);
    const milliseconds = Math.floor((rcwTimeInSeconds % 1000) / 10); // Extract only 2 digits
    const formattedTime = `${seconds < 10 ? '0' : ''}${seconds}.${milliseconds < 10 ? '0' : ''}${milliseconds}`;

    const timerElement = document.getElementById('rcw-timer');

    if (timerElement) {
      timerElement.textContent = formattedTime;
      rcwTimeInSeconds -= 100;

      if (rcwTimeInSeconds < 0) {
        clearInterval(rcwTimerInterval);
        rcwModalBodyResult.innerHTML = `<div style="text-align: center;">
                                            <div>
                                              <div style="display: inline-block; width: 60px; margin-bottom: 30px;">${rcwTimerEndPhone}</div>
                                            </div>
                                            <h3>${rcwLangData[rcwLang].call_back_soon}</h3>
                                          </div>`;
      }
    }
  }

  document.getElementById("rcw-day-pick").addEventListener("change", handleDateSelectionChange);
  document.getElementById("rcw-time-pick").addEventListener("change", handleTimeSelectionChange);
});
