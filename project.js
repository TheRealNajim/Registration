const buttons = document.querySelectorAll('quesion');

buttons.forEach( quesion =>{
    question.addEventListener('click',()=>{
        const faq = quesion.nextElementSibling;
        const icon = quesion.children[1];

        faq.classList.toggle('show');
        icon.classList.toggle('rotate');
    })
} )