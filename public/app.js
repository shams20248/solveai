document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  const priceButtons = document.querySelectorAll('[data-service]');

  priceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const service = button.getAttribute('data-service');
      const amount = button.getAttribute('data-price');
      const serviceInput = document.querySelector('input[name="service"]');
      if (serviceInput) {
        serviceInput.value = service;
      }

      const amountInput = document.querySelector('input[name="amount"]');
      if (amountInput) {
        amountInput.value = amount;
      }

      document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Request failed.');
      }

      formMessage.textContent = result.message;
      form.reset();
    } catch (error) {
      formMessage.textContent = error.message || 'Failed to send request.';
    }
  });
});
