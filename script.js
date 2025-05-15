document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav') && !event.target.closest('.menu-toggle')) {
            nav.classList.remove('active');
        }
    });
    
    // Testimonial Slider
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    // Event listeners for testimonial controls
    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        
        // Auto slide every 5 seconds
        setInterval(nextSlide, 5000);
    }
    
    // Modal functionality
    const modal = document.getElementById('orderModal');
    const receiptModal = document.getElementById('receiptModal');
    const captchaModal = document.getElementById('captchaModal');
    const serviceBtns = document.querySelectorAll('.service-btn');
    const closeModal = document.querySelector('.close-modal');
    const closeReceiptModal = document.querySelector('.close-receipt-modal');
    const closeCaptchaModal = document.querySelector('.close-captcha-modal');
    const generalOrderForm = document.getElementById('general-order-form');
    const cvOrderForm = document.getElementById('cv-order-form');
    const whatsappLink = document.getElementById('whatsapp-link');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // CAPTCHA functionality
    let captchaText = '';
    
    function generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        captchaText = '';
        
        for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const captchaImage = document.getElementById('captcha-image');
        if (captchaImage) {
            captchaImage.textContent = captchaText;
        }
    }
    
    const refreshCaptchaBtn = document.getElementById('refresh-captcha');
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener('click', generateCaptcha);
    }
    
    // Generate initial CAPTCHA
    generateCaptcha();
    
    // Verify CAPTCHA
    const verifyCaptchaBtn = document.getElementById('verify-captcha');
    if (verifyCaptchaBtn) {
        verifyCaptchaBtn.addEventListener('click', function() {
            const captchaInput = document.getElementById('captcha-input');
            
            if (captchaInput.value === captchaText) {
                // CAPTCHA is correct, proceed with WhatsApp redirect
                captchaModal.style.display = 'none';
                
                // Get the stored order data
                const currentOrder = JSON.parse(sessionStorage.getItem('currentOrder'));
                if (currentOrder && currentOrder.whatsappUrl) {
                    window.open(currentOrder.whatsappUrl, '_blank');
                }
            } else {
                // CAPTCHA is incorrect
                alert('Incorrect CAPTCHA. Please try again.');
                captchaInput.value = '';
                generateCaptcha();
            }
        });
    }
    
    // Load previous orders from localStorage
    function loadPreviousOrders() {
        const orders = JSON.parse(localStorage.getItem('bridgeInOrders')) || [];
        return orders;
    }
    
    // Save order to localStorage
    function saveOrder(orderData) {
        const orders = loadPreviousOrders();
        orders.push(orderData);
        localStorage.setItem('bridgeInOrders', JSON.stringify(orders));
    }
    
    // Generate a random order number
    function generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        return `BRG-${year}${month}${day}-${random}`;
    }
    
    // Display receipt with order details
    function showReceipt(orderData) {
        // Update receipt content
        document.getElementById('receipt-order-number').textContent = orderData.orderNumber;
        document.getElementById('receipt-date').textContent = orderData.orderDate;
        document.getElementById('receipt-service').textContent = orderData.service;
        document.getElementById('receipt-name').textContent = orderData.name;
        document.getElementById('receipt-phone').textContent = orderData.phone;
        
        // Show additional fields for CV orders
        const cvDetailsSection = document.getElementById('cv-details-section');
        if (orderData.service === 'CV Design') {
            document.getElementById('receipt-education').textContent = orderData.education || 'N/A';
            document.getElementById('receipt-address').textContent = orderData.address || 'N/A';
            document.getElementById('receipt-skills').textContent = orderData.skills || 'N/A';
            document.getElementById('receipt-profile').textContent = orderData.profile || 'N/A';
            
            // Remove photo information since we removed the upload functionality
            document.getElementById('receipt-photo').textContent = 'No photo required';
            
            cvDetailsSection.style.display = 'block';
        } else {
            cvDetailsSection.style.display = 'none';
        }
        
        document.getElementById('receipt-notes').textContent = orderData.notes || 'No additional notes';
        
        // Format the WhatsApp message
        let message;
        if (orderData.service === 'CV Design') {
            message = `Hello, I would like to order a CV Design.\n\nOrder Number: ${orderData.orderNumber}\nName: ${orderData.name}\nPhone: ${orderData.phone}\nEducation: ${orderData.education}\nAddress: ${orderData.address}\nSkills: ${orderData.skills}\nProfile: ${orderData.profile}\nNotes: ${orderData.notes}`;
        } else {
            message = `Hello, I would like to order ${orderData.service}.\n\nOrder Number: ${orderData.orderNumber}\nName: ${orderData.name}\nPhone: ${orderData.phone}\nNotes: ${orderData.notes}`;
        }
        
        // Encode the message for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        
        // Replace with your actual WhatsApp number
        const whatsappNumber = '6283157142163';
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Store the current order data in session storage for CAPTCHA verification
        const orderWithUrl = {...orderData, whatsappUrl: whatsappUrl};
        sessionStorage.setItem('currentOrder', JSON.stringify(orderWithUrl));
        
        // Set the WhatsApp link for the "Order Now" button
        whatsappLink.setAttribute('href', '#');
        whatsappLink.onclick = function(e) {
            e.preventDefault();
            captchaModal.style.display = 'block';
            generateCaptcha(); // Generate new CAPTCHA for each order
        };
        
        // Hide order modal and show receipt modal
        modal.style.display = 'none';
        receiptModal.style.display = 'block';
    }
    
    // Download receipt as image
    const downloadReceiptBtn = document.getElementById('download-receipt');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', function() {
            const receiptElement = document.querySelector('.receipt-content');
            
            // Temporarily hide the download and order buttons for the screenshot
            const receiptActions = document.querySelector('.receipt-actions');
            const originalDisplay = receiptActions.style.display;
            receiptActions.style.display = 'none';
            
            // Use html2canvas to convert the receipt to an image
            html2canvas(receiptElement).then(function(canvas) {
                // Restore the buttons
                receiptActions.style.display = originalDisplay;
                
                // Create a download link for the image
                const link = document.createElement('a');
                link.download = 'Bridge.in-Receipt-' + document.getElementById('receipt-order-number').textContent + '.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    }
    
    if (serviceBtns) {
        serviceBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const service = this.getAttribute('data-service');
                const modalTitle = document.getElementById('modal-title');
                
                // Set the modal title based on service
                if (service === 'cv') {
                    modalTitle.textContent = 'Order CV Design';
                    generalOrderForm.style.display = 'none';
                    cvOrderForm.style.display = 'block';
                } else if (service === 'banner') {
                    modalTitle.textContent = 'Order Banner Design';
                    generalOrderForm.style.display = 'block';
                    cvOrderForm.style.display = 'none';
                } else if (service === 'pamphlet') {
                    modalTitle.textContent = 'Order Pamphlet Design';
                    generalOrderForm.style.display = 'block';
                    cvOrderForm.style.display = 'none';
                } else if (service === 'instagram') {
                    modalTitle.textContent = 'Order Instagram Feed Design';
                    generalOrderForm.style.display = 'block';
                    cvOrderForm.style.display = 'none';
                }
                
                // Show the modal
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
    }
    
    // Close modal when clicking the X
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scrolling
        });
    }
    
    // Close receipt modal when clicking the X
    if (closeReceiptModal) {
        closeReceiptModal.addEventListener('click', function() {
            receiptModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scrolling
        });
    }
    
    // Close captcha modal when clicking the X
    if (closeCaptchaModal) {
        closeCaptchaModal.addEventListener('click', function() {
            captchaModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scrolling
        });
    }
    
    // Close modals when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (modal && event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scrolling
        }
        if (receiptModal && event.target === receiptModal) {
            receiptModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scrolling
        }
        if (captchaModal && event.target === captchaModal) {
            captchaModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scrolling
        }
    });
    
    // Form submission for general services
    if (generalOrderForm) {
        generalOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('[name="name"]').value;
            const phone = this.querySelector('[name="phone"]').value;
            const notes = this.querySelector('[name="notes"]').value;
            const service = document.getElementById('modal-title').textContent.replace('Order ', '');
            
            // Create order data object with order number and date
            const orderData = {
                orderNumber: generateOrderNumber(),
                orderDate: new Date().toLocaleString(),
                service: service,
                name: name,
                phone: phone,
                notes: notes
            };
            
            // Save order to localStorage
            saveOrder(orderData);
            
            // Show receipt with order details
            showReceipt(orderData);
            
            // Reset the form
            this.reset();
        });
    }
    
    // Form submission for CV design
    if (cvOrderForm) {
        cvOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const name = this.querySelector('[name="name"]').value;
                const phone = this.querySelector('[name="phone"]').value;
                const education = this.querySelector('[name="education"]').value;
                const address = this.querySelector('[name="address"]').value;
                const skills = this.querySelector('[name="skills"]').value;
                const profile = this.querySelector('[name="profile"]').value;
                const notes = this.querySelector('[name="notes"]').value;
                
                // Generate order number
                const orderNumber = generateOrderNumber();
                
                // Create order data object
                const orderData = {
                    orderNumber: orderNumber,
                    orderDate: new Date().toLocaleString(),
                    service: 'CV Design',
                    name: name,
                    phone: phone,
                    education: education,
                    address: address,
                    skills: skills,
                    profile: profile,
                    notes: notes
                };
                
                // Save order to localStorage
                saveOrder(orderData);
                
                // Show receipt with order details
                showReceipt(orderData);
                
                // Reset the form
                this.reset();
            } catch (error) {
                console.error("Form submission error:", error);
                alert("There was an error processing your order. Please try again.");
            }
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's the WhatsApp link
            if (this.id === 'whatsapp-link') {
                return;
            }
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                nav.classList.remove('active');
            }
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.padding = '15px 0';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.padding = '20px 0';
            header.style.boxShadow = 'none';
        }
    });
});
