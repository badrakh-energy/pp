document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.drag-track');
  const container = document.querySelector('.drag-container');
  const items = document.querySelectorAll('.drag-item img');

  // --- 1. HOVER "WORN" EFFECT ---
  items.forEach(item => {
    const originalSrc = item.src;
    const wornSrc = item.dataset.worn;

    item.addEventListener('mouseenter', () => {
      if (wornSrc) item.src = wornSrc;
      item.classList.add('worn');
    });

    item.addEventListener('mouseleave', () => {
      item.src = originalSrc;
      item.classList.remove('worn');
    });
  });

  // --- 2. UNSTOPPABLE AUTO-SCROLL & INFINITE LOOP ---
  let scrollSpeed = 0.8; // Change this to make it faster or slower
  let trackPos = 0;
  let isDragging = false;
  let startX = 0;
  // 1. Initialize Cart
let cart = JSON.parse(localStorage.getItem('SODO_CART')) || [];

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
}

// 2. Add to Cart (Used in shopnow.html)
function addToCart(name, price, image) {
    cart.push({ name, price, image });
    saveCart();
    showNotification(`Added ${name} to bag!`);
}

// 3. Remove Item
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function saveCart() {
    localStorage.setItem('SODO_CART', JSON.stringify(cart));
    updateCartUI();
}

// 4. Update the Look of the Cart
function updateCartUI() {
    const navCart = document.getElementById('cart-nav') || document.getElementById('cart-trigger');
    if(navCart) navCart.innerText = `Cart(${cart.length})`;
    
    const list = document.getElementById('cartItemsList');
    if(!list) return;

    if (cart.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align:center;">Your bag is empty.</p>';
    } else {
        list.innerHTML = cart.map((item, index) => `
            <div class="cart-item" style="display:flex; gap:15px; margin-bottom:15px; align-items:center;">
                <img src="${item.image}" style="width:50px; height:60px; object-fit:cover; border-radius:4px;">
                <div style="flex-grow:1;">
                    <h4 style="font-size:14px; margin:0;">${item.name}</h4>
                    <span style="font-size:13px; font-weight:bold;">${item.price.toLocaleString()}₮</span><br>
                    <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:11px; padding:0; text-decoration:underline;">Remove</button>
                </div>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const totalDiv = document.getElementById('cartTotal');
    if(totalDiv) totalDiv.innerText = `Total: ${total.toLocaleString()}₮`;
}

// 5. CHECKOUT & EMAIL LOGIC
async function handleCheckout() {
    if (cart.length === 0) return alert("Your cart is empty!");

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.innerText = "Processing...";
    checkoutBtn.disabled = true;

    // Prepare data for your Gmail
    const orderDetails = cart.map(item => `${item.name} (${item.price}₮)`).join(", ");
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

    // Send to Formspree
    try {
        const response = await fetch('https://formspree.io/f/xpqozwak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Order: orderDetails,
                Total: totalAmount + "₮",
                Message: "A new order was placed on SODO Clothing"
            })
        });

        if (response.ok) {
            showNotification("Successfully Paid! Wait until it reaches your location.");
            cart = []; // Clear cart
            saveCart();
            setTimeout(toggleCart, 2000); // Close sidebar after 2 secs
        }
    } catch (error) {
        alert("Checkout error. Please try again.");
    } finally {
        checkoutBtn.innerText = "CHECKOUT";
        checkoutBtn.disabled = false;
    }
}

// 6. Visual Notification
function showNotification(text) {
    let note = document.createElement('div');
    note.className = 'payment-note';
    note.innerText = text;
    document.body.appendChild(note);

    setTimeout(() => { note.classList.add('show'); }, 100);
    setTimeout(() => {
        note.classList.remove('show');
        setTimeout(() => note.remove(), 500);
    }, 4000);
}

document.addEventListener('DOMContentLoaded', updateCartUI);

  // Function to get current width (re-calculates if window is resized)
  const getTrackWidth = () => track.scrollWidth / 2;

  const animate = () => {
    // Only apply auto-scroll if the user isn't actively dragging
    if (!isDragging) {
      trackPos -= scrollSpeed;
    }

    const trackWidth = getTrackWidth();

    // INFINITE LOOP LOGIC
    // If it slides too far left, jump back to the middle
    if (trackPos <= -trackWidth) {
      trackPos += trackWidth;
    }
    // If it's dragged too far right, jump back to the middle
    if (trackPos > 0) {
      trackPos -= trackWidth;
    }

    // Apply the movement using hardware-accelerated transform
    track.style.transform = `translateX(${trackPos}px)`;
    
    requestAnimationFrame(animate);
  };

  // Start the infinite loop
  animate();

  // --- 3. DRAG INTERACTION ---
  const startDrag = (e) => {
    isDragging = true;
    // Calculate the initial click point relative to the current position
    const clickX = e.pageX || e.touches[0].pageX;
    startX = clickX - trackPos;
    container.style.cursor = 'grabbing';
  };

  const moveDrag = (e) => {
    if (!isDragging) return;
    
    // Prevent scrolling the whole page on mobile while dragging the gallery
    if (e.type === 'touchmove') e.preventDefault();

    const currentX = e.pageX || e.touches[0].pageX;
    trackPos = currentX - startX;
  };

  const stopDrag = () => {
    isDragging = false;
    container.style.cursor = 'grab';
  };

  // MOUSE EVENTS
  track.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', stopDrag);

  // TOUCH EVENTS (For Mobile)
  track.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', moveDrag, { passive: false });
  window.addEventListener('touchend', stopDrag);
});