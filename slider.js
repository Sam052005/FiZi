let next = document.querySelector('.next');
let prev = document.querySelector('.prev');

next.addEventListener('click', function() {
    let items = document.querySelectorAll('.item');
    let slide = document.querySelector('.slide');
    slide.appendChild(items[0]); // Move the first item to the end
});

prev.addEventListener('click', function() {
    let items = document.querySelectorAll('.item');
    let slide = document.querySelector('.slide');
    slide.prepend(items[items.length - 1]); // Move the last item to the start
});
