$(document).ready(function(){
    $('.header').height($(window).height());

    /* This code has to be executed after ".header" height is changed */
    var h = window.location.hash;
    if (h) {
        setTimeout(()=>{
            console.log("BIM", h, $(h).offset().top)
            $('html, body').stop().animate({
                scrollTop : $(h).offset().top
            }, 1000);
        },1000);
    }

    /* Scroll functionality based on the offset of each #elementsection */
    $(".navbar a.nav-link").click(function(){
        if($(this).data('value')) {
            $("body,html").animate({
                scrollTop: $("#" + $(this).data('value')).offset().top
            },1000)
        }
    })

    /* to have a smooth fade in of the grey project overlay over image */
    $(".zoom").hover(function(){
        $(this).addClass('transition');
    }, function(){
        $(this).removeClass('transition');
    });

    /* toggle logo once it is hovered over */
    $(".logo_brainweb").hover(
        /*function() {$(this).attr("src","../images/logo/logo_inverted.svg");},
        function() {$(this).attr("src","../images/logo/logo.svg");*/
        function(){
        $(this).addClass('transition');
    }, function(){
        $(this).removeClass('transition');
    });

    /* toggle collapsed menuBar icon once it is hovered over */
    $(".myCollapsedMenuBarIcon").hover(
        function() {$(this).attr("src","../images/logo/menubar_inverted.svg");},
        function() {$(this).attr("src","../images/logo/menubar.svg");
    });
})

/* go back to main page from sub pages */
function goTo(url){
    window.location.href = url;
}

/* hide menu bar once an entry is clicked */
$(function() {
    var menuVisible = false;
    $('#myMenuBtn').click(function() {
        if (menuVisible) {
            $('#myMenu').css({'display':'none'});
            menuVisible = false;
            return;
        }
        $('#myMenu').css({'display':'block'});
        menuVisible = true;
    });
    $('#myMenu').click(function() {
        $(this).css({'display':'none'});
        menuVisible = false;
    });
});

/* filter for project overview gallery on index page */
$(function() {
    var selectedClass = "";
    $(".filter").click(function(){
        selectedClass = $(this).attr("data-rel");
        $("#maingallery").fadeTo(100, 0.1);
        $("#maingallery div").not("."+selectedClass).fadeOut().removeClass('animation');
        setTimeout(function() {
        $("."+selectedClass).fadeIn().addClass('animation');
        $("#maingallery").fadeTo(300, 1);
    }, 300);
    });
});

/* hide elements until compilation completed */
var selectedChart = parseInt(2*Math.random());
function unhide() {
    const elems = document.querySelectorAll(".hide");
    [].forEach.call(elems, function(el) {
        el.classList.remove("hide");
    });
}
window.selectedChart = selectedChart;
