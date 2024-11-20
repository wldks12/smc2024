setInterval(function() {
    $('.slid').animate({left:'-1000px'}, function(){
        $('.slid').css({left:0});
        $('.slide-item:first-child').appendTo('.slid');
    }
    
    )
}  ,3500
)