let base64Image = "";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);

    // Agar URL da ma'lumot bo'lsa (yaratilgan link orqali kirilgan bo'lsa)
    if (urlParams.has('id')) {
        document.getElementById('generator-view').classList.remove('active');

        // Dastlab sovg'a oynasini ko'rsatamiz
        document.getElementById('intro-view').style.display = 'flex';

        const id = urlParams.get('id');

        // KVDB dan ma'lumotni o'qiymiz
        fetch(`https://kvdb.io/P7FivFvrixogSx4srMSjJU/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.q) document.getElementById('displayQuestion').innerText = data.q;
                if (data.s) document.getElementById('displaySuccessText').innerText = data.s;
                if (data.i) {
                    const imgEl = document.getElementById('displaySuccessImage');
                    imgEl.src = data.i;
                    imgEl.style.display = 'block';
                }

                // Rangni global xotirada saqlab qo'yamiz
                window.loadedBgColor = data.bg || '#ff9a9e';

                // Sovg'a qutisi turgan vaqtda ham orqa fon foydalanuvchi tanlagan rang va aboy bo'lsin
                setRomanticBackground(window.loadedBgColor);

                setupRunawayButton();
            })
            .catch(err => {
                console.error("Link xatosi:", err);
            });
    }

    // Rang tanlash logikasi (Yumaloq iro.js ColorPicker)
    const colorInput = document.getElementById('bgColor');

    var colorPicker = new iro.ColorPicker("#colorPicker", {
        width: 180,
        color: "#ff9a9e",
        borderWidth: 2,
        borderColor: "#ffffff",
        layout: [
            {
                component: iro.ui.Wheel,
            },
            {
                component: iro.ui.Slider,
                options: {
                    sliderType: 'value' // Yorqinlikni o'zgartirish
                }
            }
        ]
    });

    colorPicker.on('color:change', function (color) {
        colorInput.value = color.hexString;

        // Rangni namunasini ekranda ko'rsatish
        const previewBox = document.getElementById('colorPreviewBox');
        const previewText = document.getElementById('colorPreviewText');
        if (previewBox && previewText) {
            previewBox.style.background = color.hexString;
            previewText.innerText = color.hexString.toUpperCase();
        }
    });
});

// Rasm yuklanganda uni siqib Base64 formatiga o'tkazish
document.getElementById('successImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // Fayl tanlanganda matnni o'zgartirish
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = "Rasm muvaffaqiyatli tanlandi";
        document.getElementById('fileUploadBtn').style.backgroundColor = '#ffe6ee';
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            // Rasmni siqish uchun canvas dan foydalanamiz
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Sifatni 0.8 qilib base64 olamiz (ImgBB uchun)
            base64Image = canvas.toDataURL('image/jpeg', 0.8);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Adsgram uchun global kontroller
let adController = null;

function generateLink() {
    const bg = document.getElementById('bgColor').value;
    const qInput = document.getElementById('questionText').value.trim();
    const sInput = document.getElementById('successText').value.trim();

    if (!qInput || !sInput || !base64Image) {
        alert("Iltimos, barcha maydonlarni (savol, tabrik so'zi va rasm) to'ldiring!");
        return;
    }

    // Adsgram Block ID (Reklama maydoningiz kodi)
    const adsgramBlockId = "48506";

    // Agar Kutubxona yuklangan va ID o'zgartirilgan bo'lsa reklamani yoqamiz
    if (window.Adsgram && adsgramBlockId !== "SIZNING_BLOCK_ID_SHU_YERGA_YOZILADI") {
        if (!adController) {
            adController = window.Adsgram.init({ blockId: adsgramBlockId });
        }
        adController.show().then((result) => {
            // Odam reklamani to'liq ko'rdi
            processLinkGeneration(bg, qInput, sInput);
        }).catch((result) => {
            // Reklamani o'tkazib yubordi yoki yopib qo'ydi
            alert("Havola yaratish uchun videoreklamani oxirigacha ko'rishingiz shart!");
        });
    } else {
        // Hali ADSGRAM ID si yozilmagan bo'lsa (Test paytida muammosiz ishlashi uchun)
        processLinkGeneration(bg, qInput, sInput);
    }
}

function processLinkGeneration(bg, qInput, sInput) {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.textContent = "Yuklanmoqda... Kuting";
    generateBtn.disabled = true;

    const shortId = Math.random().toString(36).substring(2, 7);
    const payload = { bg: bg, q: qInput, s: sInput, i: base64Image };

    fetch(`https://kvdb.io/P7FivFvrixogSx4srMSjJU/${shortId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(() => {
            const params = new URLSearchParams();
            params.set('id', shortId);
            const link = window.location.href.split('?')[0] + '?' + params.toString();
            document.getElementById('generatedLink').value = link;

            document.getElementById('form-content').style.display = 'none';
            document.getElementById('paymentContainer').style.display = 'flex';

            generateBtn.textContent = "Sovg'ani Yaratish 🎁";
            generateBtn.disabled = false;
        })
        .catch(error => {
            generateBtn.textContent = "Sovg'ani Yaratish 🎁";
            generateBtn.disabled = false;
            alert("Internet bilan bog'lanishda xatolik yuz berdi! Qayta urinib ko'ring.");
            console.error(error);
        });
}

function resetForm() {
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('form-content').style.display = 'flex';
    document.getElementById('generatedLink').value = '';

    // Formalarni tozalash ixtiyoriy, foydalanuvchi balki faqat rasmni o'zgartirmoqchidir, 
    // Shuning uchun qiymatlarni o'zgarishsiz qoldiramiz, faqat oynalarni almashtiramiz.
}

function openGift() {
    const giftWrapper = document.querySelector('.gift-wrapper');
    const giftText = document.getElementById('giftTextMsg');

    giftWrapper.style.animation = 'none';
    if (giftText) giftText.style.display = 'none';

    // Qutini ochish va yorug'lik effektini boshlash
    giftWrapper.classList.add('opening');

    setTimeout(() => {
        document.getElementById('intro-view').style.transition = 'opacity 0.5s';
        document.getElementById('intro-view').style.opacity = '0';

        setTimeout(() => {
            document.getElementById('intro-view').style.display = 'none';
            document.getElementById('proposal-view').classList.add('active');

            // Oyna huddi sovg'a ichidan otilib chiqqandek effekt
            const pCard = document.getElementById('proposal-card');
            if (pCard) {
                pCard.style.animation = 'none';
                pCard.offsetHeight; // reflow
                pCard.style.animation = 'popOut 0.8s cubic-bezier(0.175,0.885,0.32,1.275) forwards';
            }

            // Fonni foydalanuvchi tanlagan rangga o'zgartiramiz
            const bgColor = window.loadedBgColor || '#ff9a9e';
            setRomanticBackground(bgColor);
        }, 500);
    }, 1200); // Quti ochilib nur taralishi uchun biroz ko'proq kutamiz
}

function copyLink() {
    const linkValue = document.getElementById('generatedLink').value;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(linkValue).then(() => {
            alert("Havola nusxalandi! Endi uni bemalol jo'natishingiz mumkin.");
        });
    } else {
        // Fallback
        let textArea = document.createElement("textarea");
        textArea.value = linkValue;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        alert("Havola nusxalandi! Endi uni bemalol jo'natishingiz mumkin.");
    }
}

function previewLink() {
    const link = document.getElementById('generatedLink').value;
    window.open(link, '_blank');
}

function setupRunawayButton() {
    const btnNo = document.getElementById('btnNo');
    let movedToBody = false;

    // Qochganda chiqadigan 5 ta hazilakam va samimiy so'zlar
    const funnyTexts = [
        "Tuta olmaysiz!",
        "Boshqa variant yo'q!",
        "Faqat 'Ha' bo'lishi mumkin!",
        "Baribir ko'ndiraman!",
        "Rozi bo'laqoling endi!"
    ];
    let textIndex = 0;

    const runaway = () => {
        if (!movedToBody) {
            // Tugmani o'z asil o'rnini olib, keyin body ga o'tkazamiz (ekrandan yo'qolmasligi uchun)
            const rect = btnNo.getBoundingClientRect();
            btnNo.style.left = rect.left + 'px';
            btnNo.style.top = rect.top + 'px';
            btnNo.style.zIndex = '100'; // Oyna orqasida qolib ketmasligi uchun
            document.body.appendChild(btnNo);
            btnNo.style.position = 'fixed';
            movedToBody = true;

            // O'zgarishni darhol qo'llash
            btnNo.offsetWidth;
        }

        // Yozuvni almashtirish (Har gal bitta keyingisiga o'tadi)
        btnNo.innerText = funnyTexts[textIndex];
        textIndex = (textIndex + 1) % funnyTexts.length;

        const padding = 20;

        // Kenglikni yangi yozuvga qarab hisoblaymiz
        const maxX = window.innerWidth - btnNo.offsetWidth - padding;
        const maxY = window.innerHeight - btnNo.offsetHeight - padding;

        // "Ha" tugmasining joylashuvi
        const btnYes = document.getElementById('btnYes');
        const yesRect = btnYes.getBoundingClientRect();

        let newX, newY;
        let isOverlapping = true;
        let attempts = 0;

        // Tasodifiy yangi koordinatalar, qachonki "Ha" ustiga tushib qolmasa
        while (isOverlapping && attempts < 50) {
            newX = Math.max(padding, Math.floor(Math.random() * maxX));
            newY = Math.max(padding, Math.floor(Math.random() * maxY));

            // "Ha" tugmasiga to'qnashishini tekshiramiz (kamida 30px ochiq joy qolishi kerak)
            if (
                newX > yesRect.right + 30 ||
                newX + btnNo.offsetWidth < yesRect.left - 30 ||
                newY > yesRect.bottom + 30 ||
                newY + btnNo.offsetHeight < yesRect.top - 30
            ) {
                isOverlapping = false;
            }
            attempts++;
        }

        // Teleport effekti bo'lishi uchun siljish (transition) o'chiriladi
        btnNo.style.transition = 'none';
        btnNo.style.left = newX + 'px';
        btnNo.style.top = newY + 'px';
    };

    // Sichqoncha yaqinlashganda
    btnNo.addEventListener('mouseover', runaway);

    // Telefonda bosmoqchi bo'lganda
    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        runaway();
    }, { passive: false });
}

function acceptProposal() {
    // "Ha" bosilganda oynani o'zgartirish
    document.getElementById('proposal-card').style.display = 'none';

    // "Yo'q" tugmasi body'ga biriktirilgani uchun alohida yashiramiz
    const btnNo = document.getElementById('btnNo');
    if (btnNo) btnNo.style.display = 'none';

    document.getElementById('success-view').classList.add('active');

    // Orqa fonni chiroyliroq qilish (tanlangan rang o'zgarishsiz qoladi)
    if (window.loadedBgColor) {
        setRomanticBackground(window.loadedBgColor);
    }

    createHearts();
}

// Yurakchalar animatsiyasi (SVG orqali)
function createHearts() {
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '<svg viewBox="0 0 32 29.6" width="100%" height="100%"><path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z" fill="#ff2a5f"/></svg>';
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.top = '-5vh';
            const size = (Math.random() * 25 + 15) + 'px';
            heart.style.width = size;
            heart.style.height = size;
            heart.style.opacity = Math.random() * 0.7 + 0.3;
            heart.style.zIndex = 1;
            heart.style.pointerEvents = 'none';
            heart.style.transition = 'all ' + (Math.random() * 3 + 3) + 's linear';

            document.body.appendChild(heart);

            // Animatsiyani boshlash
            setTimeout(() => {
                heart.style.top = '105vh';
                heart.style.transform = `rotate(${Math.random() * 360}deg) translateX(${Math.random() * 100 - 50}px)`;
            }, 50);

            // Ekranda yo'qolib ketgach o'chirib tashlash
            setTimeout(() => {
                heart.remove();
            }, 6000);
        }, i * 150);
    }
}

function sendToTelegram() {
    const link = document.getElementById('generatedLink').value;
    const botUsername = "Sovgachabot"; // Sizning haqiqiy botingiz
    const message = `Assalomu alaykum! Men to'lov qildim (19,990 so'm).\n\nMening maxsus VIP havolam: ${link}\n\nMana to'lov cheki:`;
    const tgUrl = `https://t.me/${botUsername}?text=${encodeURIComponent(message)}`;
    window.open(tgUrl, '_blank');
}

// Orqa fonga yurakchalar teksturasini (aboy) o'rnatuvchi maxsus funksiya
function setRomanticBackground(color) {
    document.body.style.backgroundColor = color;
    // Oq yarim-shaffof yurakchalar (aboy effekti uchun) - siz tanlagan rangga moslashadi
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 100 100"><path fill="#ffffff" fill-opacity="0.25" d="M50 85C20 60 5 40 15 20C22 5 45 5 50 25C55 5 78 5 85 20C95 40 80 60 50 85Z"/></svg>`;
    const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
    document.body.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encoded}")`;
}
