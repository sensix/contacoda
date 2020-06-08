/* eslint-disable no-console */
function BitForm(jqueryFormSelector, bitformUri) {
  this.selector = jqueryFormSelector;
  this.uri = bitformUri;
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
    const postUrl = $(form).attr('action');

    const date = new Date();

    const formData = { body: {} };

    const inputSelector = `#${$(form).attr('id')} :input`;

    $(inputSelector).not('.bitformExclude').each(function each() {
      formData.body[$(this).attr('id')] = $(this).val();
    });

    formData.uri = bf.uri;
    formData.timestamp = date.getTime();

    console.log(formData);

    $.ajax({
      url: postUrl,
      method: 'POST',
      headers: {
        'x-bitapp-uri': bf.uri,
        'Content-Type': 'application/json',
      },
      dataType: 'json',
      data: JSON.stringify(formData),
    })
      .success(() => {
        console.log('bitform 201');
        formSuccess();
      })
      .fail((xhr) => {
        console.log('bitform FAIL');
        formError();
        submitMSG(false, xhr.responseJSON.message);
      });
  }

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
};
