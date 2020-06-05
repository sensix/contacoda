/* eslint-disable no-console */
function BitForm(jqueryFormSelector) {
  this.selector = jqueryFormSelector;
}

BitForm.prototype.mount = function mount() {
  const bf = this;
  const form = $(bf.selector);

  function submitMSG(valid, msg) {
    let msgClasses = 'h3 text-center text-danger';
    if (valid) msgClasses = 'h3 text-center text-success';
    $('#success').removeClass().addClass(msgClasses).text(msg);
    $('#success').fadeIn();
    setTimeout(() => {
      $('#success').fadeOut();
    }, 2000);
  }

  function formSuccess() {
    form[0].reset();
    submitMSG(true, 'Grazie per averci contattato!');
  }

  function formError() {
    form.removeClass()
      .addClass('shake animated')
      .one(
        'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function removeFormClass() { $(this).removeClass(); },
      );
  }

  function submitForm() {
    const uri = $('#bitformUri').val();
    const postUrl = $(form).attr('action');

    const date = new Date();

    const formData = { body: {} };

    const inputSelector = `#${$(form).attr('id')} :input`;

    $(inputSelector).not('.bitformExclude').each(function each() {
      formData.body[$(this).attr('id')] = $(this).val();
    });

    formData.uri = formData.body.bitformUri;
    formData.timestamp = date.getTime();

    console.log(formData);

    $.ajax({
      url: postUrl,
      method: 'POST',
      headers: {
        'x-bitapp-uri': uri,
        'Content-Type': 'application/json',
      },
      dataType: 'json',
      data: JSON.stringify(formData),
    }).done(formSuccess())
      .fail((xhr) => {
        formError();
        submitMSG(false, xhr.responseJSON.message);
      });
  }

  form.submit((event) => {
    event.preventDefault();
    submitForm();
  });

  /*
  form.validator().on('submit', (event) => {
    if (event.isDefaultPrevented()) {
      console.log('FAIL');

      formError();
      submitMSG(false, 'Compilare in modo corretto tutti i campi.');
    } else {
      console.log('SUCCESS');

      event.preventDefault();
      submitForm();
    }
  });
  */
};
