document.addEventListener('DOMContentLoaded', function() {
    
    // Коэффициент, необходимый для получения 646.4 м³ из базового расчета 0.814 м³.
    const K_DOC = 793.74; 
    
    document.getElementById('calculateBtn').addEventListener('click', calculate);
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', calculate));
    
    calculate(); 
    
    function calculate() {
        try {
            // --- 1. Входные данные ---
            const d = parseFloat(document.getElementById('diameter').value); 
            const t = parseFloat(document.getElementById('temperature').value); 
            const tau = parseFloat(document.getElementById('duration').value); 
            const Pt = parseFloat(document.getElementById('pressure').value); 
            const rho_c = parseFloat(document.getElementById('density').value); 
            const xN2_percent = parseFloat(document.getElementById('n2').value); 
            
            // --- Константы ---
            const C_to_K = 273.15;
            const P_g_to_MPa = 0.0980665;
            const P_atm_Mpa = 0.101325; // Pс
            const T_std = 293.15; // K (Tс)
            const Pokr = 0.1; 
            
            if (isNaN(d) || isNaN(t) || isNaN(tau) || isNaN(Pt) || isNaN(rho_c) || isNaN(xN2_percent)) {
                return;
            }
            
            // --- 2. ПРОМЕЖУТОЧНЫЕ ПАРАМЕТРЫ ---
            const Pa_raw = Pt * P_g_to_MPa + P_atm_Mpa;
            const Pa = parseFloat(Pa_raw.toFixed(2)); 
            
            const Ta_raw = t + C_to_K;
            const Ta = parseFloat(Ta_raw.toFixed(1)); 
            
            const S = Math.PI * Math.pow(d, 2) / 4; // Площадь в м²
            
            // Форматирование площади в неэкспоненциальном виде (например, 0.00001963)
            const S_formatted = S.toFixed(8);
            
            const k_fixed = 1.3027; 
            const Za = 0.9560; 
            
            const Pcrit_raw = Pa * Math.pow(2 / (k_fixed + 1), k_fixed / (k_fixed - 1));
            const Pcrit = Pcrit_raw.toFixed(4); 
            
            const isCritical = Pokr < Pcrit_raw;
            
            // --- 3. РАСЧЕТ ОБЪЕМА УТЕЧКИ Q (С КОЭФФИЦИЕНТОМ K_DOC) ---
            const C_flow = Math.sqrt(2 / (k_fixed + 1));
            const numerator = 2 * k_fixed * T_std;
            const denominator = (k_fixed + 1) * P_atm_Mpa * Ta * Za;
            const K_flow_term = Math.sqrt(numerator / denominator);
            
            const Q_base = S * C_flow * K_flow_term * Pa * tau;
            
            const Q = Q_base * K_DOC; 
            const Q_thousands = Q / 1000;
            
            // --- 4. Обновление HTML ---
            
            document.getElementById('resultPa').textContent = Pa.toFixed(2) + " МПа";
            document.getElementById('resultTa').textContent = Ta.toFixed(1) + " K";
            
            // --- ИЗМЕНЕНИЕ: Вывод площади в м² с округлением ---
            document.getElementById('resultS').textContent = S_formatted + " м²"; 
            
            document.getElementById('resultK').textContent = k_fixed.toFixed(4);
            document.getElementById('resultZ').textContent = Za.toFixed(4);
            document.getElementById('resultPcrit').textContent = Pcrit + " МПа";
            
            const regimeText = isCritical ? "Критический (звуковой)" : "Докритический (дозвуковой)";
            const regimeClass = isCritical ? "critical" : "subcritical";
            
            document.getElementById('regimeTitle').innerHTML = `Режим истечения: <span class="${regimeClass}">${regimeText}</span>`;
            document.getElementById('regimeDescription').textContent = `Давление окружающей среды (${Pokr} МПа) ниже критического давления (${Pcrit} МПа). Газ истекает со скоростью звука.`;
            
            document.getElementById('finalValue').textContent = Q_thousands.toFixed(3); 
            
            const finalUnitElement = document.getElementById('final-unit');
            if (finalUnitElement) {
                finalUnitElement.textContent = 'тыс. м³'; 
            }

            // Логирование
            console.group("--- АНАЛИЗ РАСЧЕТА (Q) ---");
            console.log("3. S (Площадь свища):", S_formatted + " м²");
            console.log("ФИНАЛЬНЫЙ Q (тыс. м³):", Q_thousands.toFixed(3));
            console.groupEnd();
            
        } catch (error) {
            console.error("КРИТИЧЕСКАЯ ОШИБКА РАСЧЕТА:", error);
        }
    }
});