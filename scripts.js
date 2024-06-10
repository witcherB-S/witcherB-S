document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const adminForm = document.getElementById('adminForm');
    const productForm = document.getElementById('productForm');
    const storeContainer = document.getElementById('storeContainer');

    // نموذج تسجيل الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const accountNumber = document.getElementById('accountNumber').value;
            const password = document.getElementById('password').value;

            if (accountNumber === '1020' && password === 'a900900900') {
                localStorage.setItem('loggedInUser', 'admin');
                window.location.href = 'admin.html';
            } else if (localStorage.getItem(accountNumber) && JSON.parse(localStorage.getItem(accountNumber)).password === password) {
                localStorage.setItem('loggedInUser', accountNumber);
                window.location.href = 'account.html';
            } else {
                document.getElementById('loginMessage').innerText = 'ليس لديك حساب بالرجاء تسجيل حساب جديد';
            }
        });
    }

    // نموذج التسجيل
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const union = document.getElementById('union').value;
            const phone = document.getElementById('phone').value;

            if (!localStorage.getItem(phone)) {
                const accountNumber = '10' + Math.floor(100000000 + Math.random() * 900000000).toString();
                const user = {
                    name: name,
                    union: union,
                    phone: phone,
                    accountNumber: accountNumber,
                    balance: 0,
                    password: prompt("أدخل كلمة مرور لتسجيل الدخول:")
                };
                localStorage.setItem(accountNumber, JSON.stringify(user));
                alert('تم إنشاء الحساب بنجاح. رقم حسابك هو: ' + accountNumber);
                window.location.href = 'login.html';
            } else {
                document.getElementById('registerMessage').innerText = 'رقم الهاتف مستخدم بالفعل';
            }
        });
    }

    // صفحة حساب العميل
    if (window.location.pathname.endsWith('account.html')) {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser && loggedInUser !== 'admin') {
            const user = JSON.parse(localStorage.getItem(loggedInUser));
            document.getElementById('customerName').innerText = user.name;
            document.getElementById('accountBalance').innerText = user.balance.toFixed(2) + ' بيلي';
        } else {
            window.location.href = 'login.html';
        }
    }

    // نموذج المسؤول
    if (adminForm) {
        adminForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const targetAccountNumber = document.getElementById('targetAccountNumber').value;
            const amount = parseFloat(document.getElementById('amount').value);

            if (localStorage.getItem(targetAccountNumber)) {
                const user = JSON.parse(localStorage.getItem(targetAccountNumber));
                user.balance += amount;
                localStorage.setItem(targetAccountNumber, JSON.stringify(user));
                document.getElementById('adminMessage').innerText = 'تم تعديل الرصيد بنجاح';
                document.getElementById('adminMessage').className = 'success';
            } else {
                document.getElementById('adminMessage').innerText = 'رقم الحساب خطأ رجاءً أعد المحاولة';
                document.getElementById('adminMessage').className = 'error';
            }
        });

        // إضافة/تعديل وحذف السلع
        if (productForm) {
            productForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const productName = document.getElementById('productName').value;
                const productPrice = parseFloat(document.getElementById('productPrice').value);

                if (productName && productPrice) {
                    const products = JSON.parse(localStorage.getItem('products')) || [];
                    const existingProduct = products.find(product => product.name === productName);

                    if (existingProduct) {
                        existingProduct.price = productPrice;
                    } else {
                        products.push({ name: productName, price: productPrice });
                    }

                    localStorage.setItem('products', JSON.stringify(products));
                    document.getElementById('productMessage').innerText = 'تم إضافة/تعديل السلعة بنجاح';
                    document.getElementById('productMessage').className = 'success';
                    renderProducts();
                } else {
                    document.getElementById('productMessage').innerText = 'يجب إدخال اسم وسعر السلعة';
                    document.getElementById('productMessage').className = 'error';
                }
            });

            // عرض السلع
            function renderProducts() {
                const products = JSON.parse(localStorage.getItem('products')) || [];
                storeContainer.innerHTML = '';
                products.forEach((product, index) => {
                    const productDiv = document.createElement('div');
                    productDiv.className = 'product';
                    productDiv.innerHTML = `
                        <p>اسم السلعة: ${product.name}</p>
                        <p>السعر: ${product.price} بيلي</p>
                        <button class="deleteBtn" data-index="${index}">حذف</button>
                    `;
                    storeContainer.appendChild(productDiv);
                });

                document.querySelectorAll('.deleteBtn').forEach(button => {
                    button.addEventListener('click', function() {
                        const index = this.getAttribute('data-index');
                        const products = JSON.parse(localStorage.getItem('products')) || [];
                        products.splice(index, 1);
                        localStorage.setItem('products', JSON.stringify(products));
                        renderProducts();
                    });
                });
            }

            renderProducts();
        }
    }

// صفحة المتجر
if (window.location.pathname.endsWith('store.html')) {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const isAdmin = loggedInUser === 'admin';
    if (loggedInUser && (isAdmin || loggedInUser !== 'admin')) {
        const user = JSON.parse(localStorage.getItem(loggedInUser));
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const storeContainer = document.getElementById('storeContainer');

        storeContainer.innerHTML = '';

        products.forEach((product, index) => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.innerHTML = `
                <p>اسم السلعة: ${product.name}</p>
                <p>سعر السلعة: ${product.price.toFixed(2)} بيلي</p>
                ${!isAdmin ? `<button class="purchaseBtn" data-index="${index}">اضغط للشراء</button>` : ''}
            `;
            storeContainer.appendChild(productDiv);
        });

        if (isAdmin) {
            const deleteProductSelect = document.createElement('select');
            deleteProductSelect.innerHTML = '<option value="" selected disabled>اختر السلعة للحذف</option>';
            products.forEach((product, index) => {
                deleteProductSelect.innerHTML += `<option value="${index}">${product.name}</option>`;
            });

            const deleteProductBtn = document.createElement('button');
            deleteProductBtn.innerText = 'حذف السلعة';
            deleteProductBtn.addEventListener('click', () => {
                const selectedIndex = deleteProductSelect.selectedIndex;
                if (selectedIndex !== 0) {
                    const index = parseInt(deleteProductSelect.options[selectedIndex].value);
                    products.splice(index, 1);
                    localStorage.setItem('products', JSON.stringify(products));
                    renderStore();
                    deleteProductSelect.remove(); // حذف القائمة المنسدلة بعد الحذف
                    deleteProductBtn.remove(); // حذف زر "حذف السلعة" بعد الحذف
                } else {
                    alert('الرجاء اختيار السلعة التي تريد حذفها.');
                }
            });

            storeContainer.appendChild(deleteProductSelect);
            storeContainer.appendChild(deleteProductBtn);
        }

        storeContainer.style.display = 'block';

        storeContainer.addEventListener('click', (event) => {
            if (!isAdmin && event.target.classList.contains('purchaseBtn')) {
                const index = event.target.getAttribute('data-index');
                const product = products[index];
                const confirmPurchase = confirm(`هل أنت متأكد من شراء ${product.name} بسعر ${product.price.toFixed(2)} بيلي؟`);
                if (confirmPurchase) {
                    if (user.balance >= product.price) {
                        user.balance -= product.price;
                        localStorage.setItem(loggedInUser, JSON.stringify(user));
                        document.getElementById('purchaseMessage').innerText = 'شكراً لشرائك من متجر ويتشر، تسوق ممتع';
                        document.getElementById('purchaseMessage').className = 'success';
                    } else {
                        document.getElementById('purchaseMessage').innerText = 'عفواً، لا يوجد رصيد كافي لإتمام هذه العملية';
                        document.getElementById('purchaseMessage').className = 'error';
                    }
                }
            }
        });
    } else {
        window.location.href = 'login.html';
    }
}
});