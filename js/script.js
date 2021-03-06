///////////////////////////////////////////////////////////////////////////////
//  I S O T O P E    O P T I O N S
///////////////////////////////////////////////////////////////////////////////

(function() {
  if (!document.querySelector(".portfolio__list")) {
    return;
  }

  /**
   * Lydia: добавила полифиллы для element.matches() и
   * element.closest()
   */
  if (Element && !Element.prototype.matches) {
   var proto = Element.prototype;
   proto.matches = proto.matchesSelector ||
       proto.mozMatchesSelector || proto.msMatchesSelector ||
       proto.oMatchesSelector || proto.webkitMatchesSelector;
  }
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(css) {
      var node = this;
      while (node) {
        if (node.matches(css)) return node;
        else node = node.parentElement;
      }
      return null;
    };
  }

  // init Isotope
  var iso = new Isotope( ".portfolio__list", {
    itemSelector: ".portfolio__item",
    layoutMode: "fitRows"
  });

  // bind filter button click
  var filtersElem = document.querySelector(".portfolio__btn-group");
  eventie.bind( filtersElem, "click", function( event ) {
    /**
     * Lydia: изменила проверку клика по button, т.к. внутри кнопки
     * находится svg, и нужно, чтобы по клику на svg фильтрация работала.
     */
    var target = event.target.closest("button");
    if ( !target ) {
      return;
    }
    var filterValue = target.getAttribute("data-filter");
    iso.arrange({ filter: filterValue });
  });
})();

////////////////////////////////////////////////////////////////////////////////
//  C O N T A C T    F O R M
////////////////////////////////////////////////////////////////////////////////

(function() {
  if (!document.querySelector(".form") && !("FormData" in window)) {
    return;
  }

  //////////////////////////////////////////////////
  // Появление, события, сокрытие формы
  //////////////////////////////////////////////////

  var form = document.querySelector(".form"),
      link = document.querySelector(".nav__link--form"),
      name = form.querySelector("[name=name]"),
      email = form.querySelector("[name=email]"),
      subject = form.querySelector("[name=subject]"),
      message = form.querySelector("[name=message]"),
      btnCloseForm = form.querySelector(".btn--close-form"),
      btnSend = form.querySelector("[type=submit]"),
      savedName = localStorage.getItem("name"),
      savedEmail = localStorage.getItem("email"),
      savedSubject = localStorage.getItem("subject"),
      savedMessage = localStorage.getItem("message");

  link.addEventListener("click", function(event) {
    event.preventDefault();
    form.classList.toggle("form--show");
    removeErrorState();
    if (savedName && savedEmail && savedSubject && savedMessage) {
      putSavedData();
      message.focus();
    } else {
      name.focus();
    }
  });

  watchClick(btnCloseForm, function() {
    removeErrorState();
  });

  watchEscPressing();

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    if (name.value && email.value && subject.value && message.value) {
      saveValues();
      var data = new FormData(form);
      request(data);
    } else if (!name.value || !email.value || !subject.value || !message.value) {
      shakeForm();
      checkFormFilling();
      watchFilling();
    }
  });

  //////////////////////////////////////////////////
  // Сообщения об отправке
  //////////////////////////////////////////////////

  var alertSuccess = document.querySelector(".alert--success"),
      alertFailure = document.querySelector(".alert--failure"),
      btnCloseAlertSuccess = document.querySelector(".btn--success"),
      btnCloseAlertFailure = document.querySelector(".btn--failure");

  watchClick(btnCloseAlertSuccess);
  watchClick(btnCloseAlertFailure);

  //////////////////////////////////////////////////
  // Functions
  //////////////////////////////////////////////////

  // Ajax собственной персоной
  function request(data) {
    var xhr = new XMLHttpRequest(),
        time = (new Date()).getTime();
    xhr.open("post", "//formspree.io/ridea@bk.ru?" + time, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(data);
    xhr.addEventListener("readystatechange", function() {
      if (xhr.readyState < 4) {
        btnSend.classList.add("btn--sending");
        btnSend.innerHTML = "Sending...";
      } else if (xhr.readyState == 4) {
        btnSend.classList.remove("btn--sending");
        btnSend.innerHTML = "Send";
        form.classList.remove("form--show");
        if (xhr.status == 200) {
          alertSuccess.classList.add("alert--show");
          console.log("Success! Message has been sent. Status: " + xhr.status + ", " + xhr.statusText);
        } else {
          alertFailure.classList.add("alert--show");
          console.log("Failure! Message has not been sent. Status: " + xhr.status + ", " + xhr.statusText);
        }
      }
    });
  }

  /**
   * Закрывает попап и выполняет переданную функцию
   * (или не выполняет, если она не передана).
   */
  function watchClick(btn, fn) {
    btn.addEventListener("click", function(event) {
      event.preventDefault();
      var firstClass = btn.parentElement.classList[0],
          removedClass = firstClass + "--show";
      btn.parentElement.classList.remove(removedClass);
      // Если функция передана - выполнить.
      if (fn !== undefined) {
        fn();
      }
    });
  }

  // Убирает все попапы, если была нажата клавиша Esc.
  function watchEscPressing() {
    window.addEventListener("keydown", function(event) {
      if (event.keyCode == 27) {
        form.classList.remove("form--show");
        removeErrorState();
        alertSuccess.classList.remove("alert--show");
        alertFailure.classList.remove("alert--show");
      }
    });
  }

  // Потрясти форму.
  function shakeForm() {
    form.classList.remove("form--error");
    /**
     * TODO: разобраться, почему анимация shake
     * срабатывает только в 1-й раз.
     * setTimeout() не помогла.
     */
    form.classList.add("form--error");
  }

  // Сохранить значения из формы в хранилище браузера.
  function saveValues() {
    localStorage.setItem("name", name.value);
    localStorage.setItem("email", email.value);
    localStorage.setItem("subject", subject.value);
    localStorage.setItem("message", message.value);
  }

  // Взять значения из хранилища браузера и подставить в форму.
  function putSavedData() {
    name.value = savedName;
    email.value = savedEmail;
    subject.value = savedSubject;
    message.value = savedMessage;
  }

  // Проверяет заполненность формы.
  function checkFormFilling() {
    checkInputFilling(name);
    checkInputFilling(email);
    checkInputFilling(subject);
    checkInputFilling(message);
  }

  /**
   * Если поле не заполнено, делает его обводку красной.
   */
  function checkInputFilling(input) {
    if (!input.value) {
      var firstClass = input.classList[0],
          embedClass = firstClass + "--empty";
      input.classList.add(embedClass);
    }
  }

  /**
   * Следит за заполнением полей
   * и убирает у них красную обводку.
   */
  function watchFilling() {
    watchInputFilling(name);
    watchInputFilling(email);
    watchInputFilling(subject);
    watchInputFilling(message);
  }

  /**
   * Убирает у пустого поля красную обводку,
   * если его начинают заполнять.
   */
  function watchInputFilling(input) {
    input.addEventListener("focus", function() {
      var errorClass = input.classList[0] + "--empty";
      if (input.classList.contains(errorClass)) {
        input.classList.remove(errorClass);
      }
    });
  }

  /**
   * Форма больше не будет трястись.
   * Поля ввода больше не обведены красным.
   */
  function removeErrorState() {
    form.classList.remove("form--error");
    name.classList.remove("form__input--empty");
    email.classList.remove("form__input--empty");
    subject.classList.remove("form__input--empty");
    message.classList.remove("form__message--empty");
  }
})();

///////////////////////////////////////////////////////////////////////////////
// N A V I G A T I O N   B A R
///////////////////////////////////////////////////////////////////////////////

(function() {
  // конструктор для navbar'а
  function Navbar(options) {
    var element = this.element = options.element,
        btn = element.querySelector(".navbar__toggle");

    // создаем список ссылок, которые ведут к секциям
    var allLinks = element.getElementsByClassName("nav__link");
    this.links = Array.prototype.filter.call(allLinks, function(link) {
      var id = link.getAttribute("href").slice(1);
      if (document.getElementById(id)) return true;
    });

    element.onclick = function(event) {
      if (event.target === btn) toggle();
    };

    function toggle() {
      element.classList.toggle("navbar--drop-nav");
    }
  }

  // создаем navbar
  var navbar = new Navbar({
    element: document.getElementById("navbar")
  });



  // на сколько прокрутили в прошлый раз
  var lastScroll = 0;
  // текущая прокрутка
  var currentScroll;

  // создаем список секций, к которым ведут ссылки
  var sections = [];
  navbar.links.forEach(function(link) {
    // определяем id
    var id = link.getAttribute("href").slice(1);
    // вносим в список
    sections.push(document.getElementById(id));
  });

  // когда прокручивается страница
  window.addEventListener("scroll", throttle(callback, 250));

  // возвращает функцию через определенное количество времени
  function throttle(func, wait) {
    var time = Date.now();
    return function() {
      if ((time + wait - Date.now()) < 0) {
        func();
        time = Date.now();
      }
    };
  }

  function callback() {
    // определяем на сколько прокрутили
    currentScroll = window.pageYOffset;

    // прячем или показываем navbar
    pushNavbar(lastScroll, currentScroll);

    // подсвечиваем ссылку
    highlightLink();

    // запоминаем на сколько прокрутили страницу
    lastScroll = currentScroll;
  }

  // прячет или показывает navbar, когда прокручивают страницу
  function pushNavbar(lastScroll, currentScroll) {
    // если прокрутили вниз - прячем
    if (currentScroll > lastScroll)
      navbar.element.className = "navbar navbar--hidden";
    // если вверх - показываем
    else
      navbar.element.className = "navbar";
  }

  // подсвечивает ссылки в навигации
  function highlightLink() {
    // определяем, какая секция сейчас просматривается
    var currentSection = defineSection();
    // если никакая - ничего не делаем
    if (!currentSection) {
      resetLinks();
      return;
    }

    // получаем номер ссылки
    var index = sections.indexOf(currentSection);
    // сначала сбрасываем все ссылки
    resetLinks();
    // потом подсвечиваем нужную
    navbar.links[index].classList.add("nav__link--current");

    function resetLinks() {
      navbar.links.forEach(function(link) {
        link.classList.remove("nav__link--current");
      });
    }
  }

  // определяет, какая секция сейчас просматривается
  function defineSection() {
    // просматриваемая секция (пока не знаем, которая)
    var currentSection;
    // верхняя и нижняя координаты секции
    var coords;
    // половина высоты экрана
    var half = window.innerHeight / 2;

    // определяем, какая секция сейчас просматривается
    for (var i = 0; i < sections.length; i++) {
      // получаем координаты секции
      coords = getCoords(sections[i]);
      // проверяем по координатам, просматривается ли сейчас секция
      if (currentScroll > coords.top - half &&
          currentScroll < coords.bottom - half) {
        // запоминаем просматриваемую секцию
        currentSection = sections[i];
        break;
      }
    }

    return currentSection || null;
  }

  // возвращает верхнюю и нижнюю координаты секции
  function getCoords(section) {
    var box = section.getBoundingClientRect();
    return {
      top: box.top + window.pageYOffset,
      bottom: box.bottom + window.pageYOffset
    };
  }
})();

///////////////////////////////////////////////////////////////////////////////
//  W O W    O P T I O N S
///////////////////////////////////////////////////////////////////////////////

var wow = new WOW({
  mobile: false,
  offset: 200
});

wow.init();
