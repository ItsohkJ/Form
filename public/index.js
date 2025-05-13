function toggleCaste() {
    const caste = document.getElementById('caste');
    const casteFile = document.getElementById('casteFile');
    const incomeFile = document.getElementById('incomeFile');
    const screenWidth = screen.width;

    if (caste.value === 'sc' || caste.value === 'bca' || caste.value === 'bcb') {
        if (screenWidth > 480 && screenWidth <= 1280) {
            casteFile.style.display = "flex";
            incomeFile.style.display = "flex";
            casteFile.style.justifyContent = "space-between";
            incomeFile.style.justifyContent = "space-between";
        } else if (screenWidth <= 480) {
            casteFile.style.display = "block";
            incomeFile.style.display = "block";
        } else {
            casteFile.style.display = "flex";
            incomeFile.style.display = "flex";
            casteFile.style.justifyContent = "flex-start";
            incomeFile.style.justifyContent = "flex-start";
        }
    } else {
        casteFile.style.display = "none";
        incomeFile.style.display = "none";
    }
}
function togglePostGradSection() {
    const pgSection = document.getElementById('postGradSection');
    const pursuedPgYes = document.getElementById('pg_yes');
    
    if (pursuedPgYes.checked) {
        pgSection.style.display = "block";
    } else {
        pgSection.style.display = "none";
    }
}


window.onload = function() {
    toggleCaste();
    document.getElementById('caste').addEventListener('change', toggleCaste);
    document.querySelectorAll('input[name="pursued_pg"]').forEach((input) => {
        input.addEventListener('change', togglePostGradSection);
    });
}

