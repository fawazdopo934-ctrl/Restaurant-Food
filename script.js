// Données du panier
let cart = [];
let wishlist = [];

// Éléments du DOM
const cartIcon = document.querySelector(".cart-icon");
const cartCount = document.querySelector(".cart-count");
const cartModal = document.getElementById("cartModal");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const closeModalBtns = document.querySelectorAll(".close-modal");
const addToCartBtns = document.querySelectorAll(".add-to-cart");
const wishlistBtns = document.querySelectorAll(".wishlist-btn");
const filterBtns = document.querySelectorAll(".filter-btn");
const menuCards = document.querySelectorAll(".menu-card");
const orderForm = document.getElementById("orderForm");
const confirmationModal = document.getElementById("confirmationModal");
const confirmationMessage = document.getElementById("confirmationMessage");
const paymentMethodSpan = document.getElementById("paymentMethod");
const closeConfirmation = document.getElementById("closeConfirmation");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const searchIcon = document.querySelector(".search-icon");
const reviewContainer = document.querySelector(".review-container");
const reviewCards = document.querySelectorAll(".review-card");
const sliderPrev = document.querySelector(".slider-prev");
const sliderNext = document.querySelector(".slider-next");
const viewDishBtns = document.querySelectorAll(".view-dish");

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadCartFromStorage();
  loadWishlistFromStorage();
  initSlider();
  checkActiveNavLink();
});

// Gestion du scroll pour la navigation
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (window.scrollY > 100) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
  checkActiveNavLink();
});

// Vérifier et mettre à jour le lien actif
function checkActiveNavLink() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-menu li a");

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// Menu toggle pour mobile
menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

// Fermer le menu mobile quand on clique sur un lien
navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("show");
  });
});

// Fonctions du panier
function loadCartFromStorage() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
  }
}

function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function updateCartDisplay() {
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart">Votre panier est vide</p>';
    cartTotal.textContent = "$0.00";
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    html += `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="decrease-quantity" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-index="${index}">+</button>
                    </div>
                </div>
                <i class="fa-solid fa-trash remove-item" data-index="${index}"></i>
            </div>
        `;
  });

  cartItemsContainer.innerHTML = html;
  cartTotal.textContent = `$${total.toFixed(2)}`;

  // Ajouter les événements pour les boutons de quantité
  document.querySelectorAll(".decrease-quantity").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      decreaseQuantity(index);
    });
  });

  document.querySelectorAll(".increase-quantity").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      increaseQuantity(index);
    });
  });

  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      removeFromCart(index);
    });
  });
}

function addToCart(id, name, price, image) {
  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id,
      name,
      price,
      image,
      quantity: 1,
    });
  }

  saveCartToStorage();
  updateCartCount();
  updateCartDisplay();

  // Animation du panier
  cartIcon.style.transform = "scale(1.2)";
  setTimeout(() => {
    cartIcon.style.transform = "scale(1)";
  }, 200);

  // Notification toast
  showToast(`${name} ajouté au panier`);
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    removeFromCart(index);
    return;
  }
  saveCartToStorage();
  updateCartCount();
  updateCartDisplay();
}

function increaseQuantity(index) {
  cart[index].quantity += 1;
  saveCartToStorage();
  updateCartCount();
  updateCartDisplay();
}

function removeFromCart(index) {
  const item = cart[index];
  cart.splice(index, 1);
  saveCartToStorage();
  updateCartCount();
  updateCartDisplay();
  showToast(`${item.name} retiré du panier`);
}

function clearCart() {
  cart = [];
  saveCartToStorage();
  updateCartCount();
  updateCartDisplay();
  showToast("Panier vidé");
}

// Fonctions de wishlist
function loadWishlistFromStorage() {
  const savedWishlist = localStorage.getItem("wishlist");
  if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist);
    updateWishlistButtons();
  }
}

function saveWishlistToStorage() {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function toggleWishlist(btn, id, name) {
  const icon = btn.querySelector("i");
  const index = wishlist.indexOf(id);

  if (index === -1) {
    wishlist.push(id);
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
    btn.classList.add("active");
    showToast(`${name} ajouté aux favoris`);
  } else {
    wishlist.splice(index, 1);
    icon.classList.remove("fa-solid");
    icon.classList.add("fa-regular");
    btn.classList.remove("active");
    showToast(`${name} retiré des favoris`);
  }

  saveWishlistToStorage();
}

function updateWishlistButtons() {
  wishlistBtns.forEach((btn) => {
    const id = btn.closest(".menu-card").querySelector(".add-to-cart")
      .dataset.id;
    const icon = btn.querySelector("i");

    if (wishlist.includes(id)) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      btn.classList.add("active");
    } else {
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      btn.classList.remove("active");
    }
  });
}

// Toast notification
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Événements
addToCartBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const image = btn.dataset.image;
    addToCart(id, name, price, image);
  });
});

wishlistBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.closest(".menu-card").querySelector(".add-to-cart")
      .dataset.id;
    const name = btn.closest(".menu-card").querySelector("h3").textContent;
    toggleWishlist(btn, id, name);
  });
});

// Ouvrir le panier
cartIcon.addEventListener("click", () => {
  cartModal.classList.add("show");
});

// Fermer les modals
closeModalBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    cartModal.classList.remove("show");
  });
});

window.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    cartModal.classList.remove("show");
  }
  if (e.target === confirmationModal) {
    confirmationModal.classList.remove("show");
  }
});

clearCartBtn.addEventListener("click", clearCart);

// Checkout
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Votre panier est vide");
    return;
  }

  // Rediriger vers la section commande
  document.getElementById("Order").scrollIntoView({ behavior: "smooth" });
  cartModal.classList.remove("show");
});

// Filtres du menu
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Mettre à jour les boutons actifs
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    // Filtrer les cartes
    menuCards.forEach((card) => {
      if (filter === "all" || card.dataset.category === filter) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});

// Gestion du formulaire de commande
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Récupérer les données du formulaire
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    quantity: document.getElementById("quantity").value,
    dish: document.getElementById("dish").value,
    address: document.getElementById("address").value,
    payment: document.querySelector('input[name="payment"]:checked').value,
  };

  // Validation
  if (
    !formData.name ||
    !formData.email ||
    !formData.phone ||
    !formData.dish ||
    !formData.address
  ) {
    showToast("Veuillez remplir tous les champs");
    return;
  }

  if (!validateEmail(formData.email)) {
    showToast("Email invalide");
    return;
  }

  if (!validatePhone(formData.phone)) {
    showToast("Numéro de téléphone invalide");
    return;
  }

  // Afficher la confirmation
  confirmationMessage.textContent = `Merci ${formData.name} ! Votre commande de ${formData.quantity} x ${formData.dish} a été enregistrée.`;

  let paymentText = "";
  switch (formData.payment) {
    case "card":
      paymentText = "Paiement par carte bancaire";
      break;
    case "mobile":
      paymentText = "Paiement par Mobile Money";
      break;
    case "paypal":
      paymentText = "Paiement par PayPal";
      break;
  }
  paymentMethodSpan.textContent = paymentText;

  confirmationModal.classList.add("show");

  // Réinitialiser le formulaire
  orderForm.reset();

  // Vider le panier
  clearCart();
});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s\+\-]{10,}$/.test(phone);
}

closeConfirmation.addEventListener("click", () => {
  confirmationModal.classList.remove("show");
});

// Barre de recherche
searchIcon.addEventListener("click", () => {
  const searchTerm = prompt("Rechercher un plat...");
  if (searchTerm) {
    const found = Array.from(menuCards).find((card) =>
      card
        .querySelector("h3")
        .textContent.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

    if (found) {
      found.scrollIntoView({ behavior: "smooth" });
      found.style.animation = "pulse 0.5s ease";
      setTimeout(() => {
        found.style.animation = "";
      }, 500);
    } else {
      showToast("Aucun plat trouvé");
    }
  }
});

// Slider d'avis
let currentSlide = 0;
const slideWidth = reviewCards[0]?.offsetWidth || 0;

function initSlider() {
  if (reviewCards.length === 0) return;

  const containerWidth = reviewContainer.offsetWidth;
  const visibleCards =
    window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
  const cardWidth = containerWidth / visibleCards;

  reviewCards.forEach((card) => {
    card.style.minWidth = `${cardWidth - 32}px`;
  });
}

function slide(direction) {
  const visibleCards =
    window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
  const maxSlide = Math.max(0, reviewCards.length - visibleCards);

  currentSlide += direction;
  if (currentSlide < 0) currentSlide = 0;
  if (currentSlide > maxSlide) currentSlide = maxSlide;

  const slideAmount = -(currentSlide * slideWidth);
  reviewContainer.style.transform = `translateX(${slideAmount}px)`;
}

sliderPrev?.addEventListener("click", () => slide(-1));
sliderNext?.addEventListener("click", () => slide(1));

window.addEventListener("resize", () => {
  initSlider();
  currentSlide = 0;
  reviewContainer.style.transform = "translateX(0)";
});

// Voir le plat depuis la galerie
viewDishBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const dishName = e.target.dataset.dish;
    const menuSection = document.getElementById("Menu");
    menuSection.scrollIntoView({ behavior: "smooth" });

    // Trouver et surligner le plat correspondant
    const matchingCard = Array.from(menuCards).find((card) =>
      card.querySelector("h3").textContent.includes(dishName),
    );

    if (matchingCard) {
      setTimeout(() => {
        matchingCard.style.animation = "pulse 0.5s ease";
        setTimeout(() => {
          matchingCard.style.animation = "";
        }, 500);
      }, 500);
    }
  });
});

// Animation au scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

document
  .querySelectorAll(".menu-card, .gallary-item, .team-member, .review-card")
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
