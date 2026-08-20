// Eloria Contact Form

const contactForm = document.querySelector("form");
const phoneInput = document.getElementById("phone");

phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get input values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    // Check name
    if (name === "") {
        alert("Please enter your name.");
        return;
    }

    // Check email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Check phone number
    const phonePattern = /^(?:\+94|0)7[0-9]{8}$/;

    if (!phonePattern.test(phone.replace(/[\s-]/g, ""))) {
        alert("Please enter a valid Sri Lankan mobile number, for example 0771234567.");
        return;
    }

    // Check message
    if (message === "") {
        alert("Please enter your message.");
        return;
    }

    // Successful submission
    alert(
        "Thank you, " + name + " \n\n" +
        "Your message has been sent to Eloria.\n" +
        "We will get back to you soon!"
    );

    // Clear the form
    contactForm.reset();
});
