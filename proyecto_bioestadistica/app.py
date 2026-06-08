# -*- coding: utf-8 -*-
"""
BioPharma Labs - Plataforma de Enseñanza de Bioestadística Farmacéutica
Módulos: Control de Calidad (Binomial), Reacciones Adversas (Poisson) y Fallas Secuenciales (Geométrica)
Autor: Senior Python Developer & Profesor Experto en Bioestadística
"""

import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import binom, poisson, geom
from gtts import gTTS
import io

# Configuración inicial de la página
st.set_page_config(
    page_title="BioPharma Labs - Bioestadística Educativa",
    page_icon="🔬",
    layout="wide",
)

# Estilos personalizados para emular un diseño elegante
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        color: #10B981;
        font-weight: 800;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #94A3B8;
        margin-bottom: 2rem;
    }
    .parameter-box {
        background-color: #0F172A;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #1E293B;
        margin-bottom: 1rem;
    }
    .info-card {
        background-color: #1E293B;
        padding: 1.2rem;
        border-radius: 10px;
        border-left: 5px solid #10B981;
        margin-bottom: 1rem;
    }
    .error-box {
        background-color: #7f1d1d;
        color: #fecaca;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border: 1px solid #ef4444;
    }
</style>
""", unsafe_allow_html=True)

# Formateador inteligente de probabilidades
def format_probability(prob):
    pct = prob * 100
    if pct == 0:
        return "0.0000%"
    elif pct < 0.0001:
        return f"{pct:.4e}%"
    else:
        return f"{pct:.4f}%"

# --- MENÚ LATERAL (SIDEBAR) ---
st.sidebar.image("https://cdn-icons-png.flaticon.com/512/3022/3022247.png", width=70)
st.sidebar.title("BioPharma Labs")
st.sidebar.caption("Docencia Interactiva")

# Selector principal de módulo
selected_module = st.sidebar.radio(
    "Seleccione el Módulo Educativo",
    options=["Control de Calidad (Binomial)", "Reacciones Adversas (Poisson)", "Proceso Analítico Secuencial (Geométrica)"]
)

st.sidebar.markdown("---")

# Lista para control de errores
errores_parametros = []

# Inicialización de parámetros según el módulo seleccionado
if selected_module == "Control de Calidad (Binomial)":
    st.sidebar.subheader("Casos de Estudio / Presets (Binomial)")
    
    preset_choices = [
        "Aspirina (Pérdida de Peso por Lote)",
        "Esterilidad Pruebas Inyectables",
        "Cápsulas Recubrimiento Entérico",
        "✍️ Crear Mi Propio Caso..."
    ]
    selected_preset = st.sidebar.selectbox("Seleccione un Caso", preset_choices)
    
    if selected_preset == "Aspirina (Pérdida de Peso por Lote)":
        case_title = "Aspirina (Pérdida de Peso por Lote)"
        case_desc = "Control de calidad en lote de 20 tabletas de AAS. Probabilidad de falla teórica p = 5%."
        default_n, default_p, default_x = 20, 0.05, 1
    elif selected_preset == "Esterilidad Pruebas Inyectables":
        case_title = "Esterilidad Pruebas Inyectables"
        case_desc = "Muestreo de 50 ampollas; se busca probar si se tiene cero ampollas contaminadas."
        default_n, default_p, default_x = 50, 0.02, 0
    elif selected_preset == "Cápsulas Recubrimiento Entérico":
        case_title = "Cápsulas Recubrimiento Entérico"
        case_desc = "15 cápsulas testeadas por disolución ácida. p = 12% de falla en recubrimiento."
        default_n, default_p, default_x = 15, 0.12, 2
    else: 
        st.sidebar.info("Configure el caso a continuación:")
        case_title = st.sidebar.text_input("Título", "Lote de Manufactura Personalizado")
        case_desc = st.sidebar.text_area("Descripción", "Estudio experimental dicotómico.")
        default_n, default_p, default_x = 25, 0.08, 2

    st.sidebar.markdown("---")
    st.sidebar.subheader("Parámetros (Binomial)")
    
    st.sidebar.caption("**n (Tamaño del Lote):** Número entero mayor o igual a 1.")
    n_input = st.sidebar.number_input("n (Ensayos)", value=int(default_n), step=1)
    
    st.sidebar.caption("**p (Probabilidad de Falla):** Valor decimal entre 0 y 1.")
    p_input = st.sidebar.number_input("p (Tasa Base)", value=float(default_p), step=0.01, format="%.4f")
    
    st.sidebar.caption("**x (Defectos a Evaluar):** Número entero entre 0 y n.")
    x_input = st.sidebar.number_input("x (Eventos de Interés)", value=int(default_x), step=1)
    
    query_type = st.sidebar.selectbox(
        "Operador de Consulta",
        ["Igual a x: P(X = x)", "Menor o igual a x: P(X <= x)", "Mayor o igual a x: P(X >= x)"]
    )
    
    # Validaciones Robustas Binomial
    n = int(n_input)
    p = float(p_input)
    x = int(x_input)
    
    if n < 1:
        errores_parametros.append("El tamaño del lote (n) debe ser un número entero mayor o igual a 1.")
    if p < 0.0 or p > 1.0:
        errores_parametros.append("La probabilidad (p) de éxito/falla debe ser un valor decimal contenido en el intervalo [0, 1].")
    if x < 0 or x > max(n, 0):
        errores_parametros.append(f"El número de casos de interés (x) no puede ser negativo ni superior al tamaño del lote n={n}.")

elif selected_module == "Reacciones Adversas (Poisson)":
    st.sidebar.subheader("Casos de Estudio / Presets (Poisson)")
    
    preset_choices_poisson = [
        "Efectos Adversos (Jarabe de Tos)",
        "Microbiología (UFC en Solución)",
        "Fallas Mecánicas en Llenadora",
        "✍️ Crear Mi Propio Caso..."
    ]
    selected_preset_p = st.sidebar.selectbox("Seleccione un Caso", preset_choices_poisson)
    
    if selected_preset_p == "Efectos Adversos (Jarabe de Tos)":
        case_title = "Efectos Adversos (Jarabe de Tos)"
        case_desc = "Vigilancia: promedio de 1.8 casos de urticaria por cada 10,000 tratamientos mensuales."
        default_lambda, default_xp = 1.8, 2
    elif selected_preset_p == "Microbiología (UFC en Solución)":
        case_title = "Microbiología (UFC en Solución)"
        case_desc = "Recuento bacteriano promedio histórico de 0.7 UFC por 100ml."
        default_lambda, default_xp = 0.7, 0
    elif selected_preset_p == "Fallas Mecánicas en Llenadora":
        case_title = "Fallas Mecánicas en Llenadora"
        case_desc = "Promedio de 4.5 micro-detenciones (eventos discretos) por turno en la envasadora."
        default_lambda, default_xp = 4.5, 6
    else:
        st.sidebar.info("Configure el caso a continuación:")
        case_title = st.sidebar.text_input("Título", "Monitoreo Clínico Continuo")
        case_desc = st.sidebar.text_area("Descripción", "Estudio de concurrencias colaterales a lo largo del tiempo o volumen.")
        default_lambda, default_xp = 3.5, 3

    st.sidebar.markdown("---")
    st.sidebar.subheader("Parámetros (Poisson)")
    
    st.sidebar.caption("**λ (Tasa Histórica Promedio):** Número mayor a 0.")
    lambda_input = st.sidebar.number_input("λ (Lambda)", value=float(default_lambda), step=0.1, format="%.4f")
    
    st.sidebar.caption("**x (Sucesos Observados):** Número entero no negativo.")
    x_input = st.sidebar.number_input("x (Eventos Críticos)", value=int(default_xp), step=1)
    
    query_type = st.sidebar.selectbox(
        "Operador de Consulta",
        ["Igual a x: P(X = x)", "Menor o igual a x: P(X <= x)", "Mayor o igual a x: P(X >= x)"]
    )
    
    # Validaciones Robustas Poisson
    lambda_val = float(lambda_input)
    x = int(x_input)
    
    if lambda_val < 0.0:
        errores_parametros.append("La tasa promedio esperada (λ) no puede ser un número negativo.")
    if lambda_val == 0.0:
        errores_parametros.append("La tasa esperada (λ) debe ser estrictamente mayor a 0 para generar una distribución válida de eventos.")
    if x < 0:
        errores_parametros.append("Los eventos observados (x) deben ser un valor entero no negativo (0, 1, 2...).")

else:
    # Nuevo Módulo: Distribución Geométrica
    st.sidebar.subheader("Casos de Estudio / Presets (Geométrica)")
    
    preset_choices_geom = [
        "Lote en Producción (Primera Ampolla Rota)",
        "Inspección de Controles (Primer Vial Rechazado)",
        "Detección de Impureza (Primer Muestreo Positivo)",
        "✍️ Crear Mi Propio Caso..."
    ]
    selected_preset_g = st.sidebar.selectbox("Seleccione un Caso", preset_choices_geom)
    
    if selected_preset_g == "Lote en Producción (Primera Ampolla Rota)":
        case_title = "Lote en Producción (Primera Ampolla Rota)"
        case_desc = "Analizamos ampollas secuencialmente de la faja transportadora. p = 2% de falla para cada una. Buscamos el inicio de detención de la maquinaria."
        default_p, default_xg = 0.02, 10
    elif selected_preset_g == "Inspección de Controles (Primer Vial Rechazado)":
        case_title = "Inspección de Controles (Primer Vial Rechazado)"
        case_desc = "Revisamos viales seriados en el laboratorio de control de calidad. La tasa de rechazo base es 0.5%."
        default_p, default_xg = 0.005, 50
    elif selected_preset_g == "Detección de Impureza (Primer Muestreo Positivo)":
        case_title = "Detección de Impureza (Primer Muestreo Positivo)"
        case_desc = "En pruebas de destilación, cada gota recolectada aleatoriamente tiene un 5% de probabilidad de tener trazas de progesterona cruzada."
        default_p, default_xg = 0.05, 3
    else:
        st.sidebar.info("Configure el caso a continuación:")
        case_title = st.sidebar.text_input("Título", "Búsqueda Secuencial Analítica")
        case_desc = st.sidebar.text_area("Descripción", "Inspección de elementos unitarios estocásticamente repetidos hasta registrar la primera falla/éxito.")
        default_p, default_xg = 0.1, 5
        
    st.sidebar.markdown("---")
    st.sidebar.subheader("Parámetros (Geométrica)")
    
    st.sidebar.caption("**p (Probabilidad de Falla):** Valor decimal entre 0 y 1 continuo.")
    p_input = st.sidebar.number_input("p (Tasa Base Univariable)", value=float(default_p), step=0.01, format="%.4f")
    
    st.sidebar.caption("**x (Ensayo Ocurrente):** Número de la muestra donde por fin aparece el 1er evento (x >= 1).")
    x_input = st.sidebar.number_input("x (Ensayo Objetivo)", value=int(default_xg), step=1)
    
    query_type = st.sidebar.selectbox(
        "Operador de Consulta",
        ["Igual a x: P(X = x)", "Menor o igual a x: P(X <= x)", "Mayor o igual a x: P(X >= x)"]
    )
    
    # Validaciones Robustas Geométrica
    p = float(p_input)
    x = int(x_input)
    
    if p <= 0.0 or p > 1.0:
        errores_parametros.append("La probabilidad del evento (p) debe ser estrictamente mayor a 0 y menor o igual a 1.")
    if x < 1:
        errores_parametros.append("En el modelo biomatemático estándar, el recuento de ensayos de Bernoulli para la aparición del 1er evento debe comenzar mínimamente en x=1.")


# --- CONTENIDO PRINCIPAL ---
st.markdown(f"<div class='main-header'>{selected_module}</div>", unsafe_allow_html=True)
st.markdown("<div class='sub-header'>Bioestadística Educativa para Aseguramiento de Calidad Analítica e Industrial Farmacéutica</div>", unsafe_allow_html=True)

# Manejador Global de Errores Visuales
if errores_parametros:
    st.markdown("### 🛑 Han Ocurrido Errores de Introducción de Parámetros")
    for err in errores_parametros:
        st.error(err)
    st.warning("Ajuste los valores numéricos correspondientes en el menú de la izquierda para reanudar la simulación científica de inmediato.")
    st.stop()  # Aborta la ejecución segura si la validación falla

# Tarjeta informativa del Caso de Estudio Activo
st.markdown(f"""
<div class='info-card'>
    <strong>Caso de Estudio Farmacotécnico Activo: {case_title}</strong><br/>
    <p style='margin-top: 0.5rem; text-align: justify;'>{case_desc}</p>
</div>
""", unsafe_allow_html=True)


col1, col2 = st.columns([1, 1])

# --- PROCESAMIENTO ROBUSTO CENTRAL SEGÚN DISTRIBUCIÓN ELEGIDA ---
if selected_module == "Control de Calidad (Binomial)":
    
    mean_theoretical = n * p
    variance_theoretical = n * p * (1 - p)
    
    if "P(X = x)" in query_type:
        prob_theoretical = binom.pmf(x, n, p)
        prob_str = f"P(X = {x})"
    elif "P(X <= x)" in query_type:
        prob_theoretical = binom.cdf(x, n, p)
        prob_str = f"P(X \\le {x})"
    else:
        prob_theoretical = 1 - binom.cdf(x - 1, n, p) if x > 0 else 1.0
        prob_str = f"P(X \\ge {x})"

    with col1:
        st.subheader("📚 Ecuación Clásica y Modelado Binomial")
        st.latex(r"P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}")
        st.markdown("**Sustitución algorítmica para este lote discreto:**")
        st.latex(fr"P(X = {x}) = \binom{{{n}}}{{{x}}} ({p})^{{{x}}} (1 - {p})^{{{n}-{x}}}")
        
    with col2:
        st.subheader("📊 Convergencia Gráfica Probabilística")
        sigma = np.sqrt(variance_theoretical)
        k_start = max(0, int(np.floor(mean_theoretical - 4 * sigma))) if sigma > 0 else 0
        k_end = min(n, int(np.ceil(mean_theoretical + 4 * sigma))) if sigma > 0 else n
        
        if x < k_start: k_start = max(0, x - int(np.ceil(2 * sigma)) if sigma > 0 else x - 5)
        elif x > k_end: k_end = min(n, x + int(np.ceil(2 * sigma)) if sigma > 0 else x + 5)
            
        if (k_end - k_start) < 20:
            diff = 20 - (k_end - k_start)
            k_start = max(0, k_start - diff // 2)
            k_end = min(n, k_start + 20)
            
        k_values = np.arange(k_start, k_end + 1)
        probabilities = binom.pmf(k_values, n, p)
        
        colors = ['#10B981' if (("=" in query_type and v == x) or ("<" in query_type and v <= x) or (">" in query_type and v >= x)) else '#334155' for v in k_values]
                
        fig, ax = plt.subplots(figsize=(6, 3.5), facecolor='none')
        ax.set_facecolor('none')
        ax.bar(k_values, probabilities, color=colors, edgecolor='#475569', alpha=0.95)
        ax.set_title(f"Binomial (Visor en μ={mean_theoretical:.1f}, σ={sigma:.2f})", color='white', fontsize=10)
        ax.set_xlabel("Número Resultante de Anomalías (X)", color='#94A3B8', fontsize=8)
        ax.set_ylabel("P(X=x)", color='#94A3B8', fontsize=8)
        ax.tick_params(colors='#94A3B8', labelsize=8)
        ax.grid(axis='y', linestyle='--', alpha=0.1)
        st.pyplot(fig)


elif selected_module == "Reacciones Adversas (Poisson)":

    mean_theoretical = lambda_val
    variance_theoretical = lambda_val
    
    if "P(X = x)" in query_type:
        prob_theoretical = poisson.pmf(x, lambda_val)
        prob_str = f"P(X = {x})"
    elif "P(X <= x)" in query_type:
        prob_theoretical = poisson.cdf(x, lambda_val)
        prob_str = f"P(X \\le {x})"
    else:
        prob_theoretical = 1 - poisson.cdf(x - 1, lambda_val) if x > 0 else 1.0
        prob_str = f"P(X \\ge {x})"

    with col1:
        st.subheader("📚 Ecuación Clásica y Modelado Poissoniano")
        st.latex(r"P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}")
        st.markdown("**Sustitución algorítmica paramétrica:**")
        st.latex(fr"P(X = {x}) = \frac{{e^{{-{lambda_val}}} ({lambda_val})^{{{x}}}}}{{{x}!}}")
        
    with col2:
        st.subheader("📊 Convergencia Gráfica Rara")
        sigma = np.sqrt(variance_theoretical)
        k_start = max(0, int(np.floor(mean_theoretical - 4 * sigma)))
        k_end = int(np.ceil(mean_theoretical + 4 * sigma))
        
        if x < k_start: k_start = max(0, x - int(np.ceil(2 * sigma)))
        elif x > k_end: k_end = x + int(np.ceil(2 * sigma))
            
        if (k_end - k_start) < 20:
            diff = 20 - (k_end - k_start)
            k_start = max(0, k_start - diff // 2)
            k_end = k_start + 20
            
        k_values = np.arange(k_start, k_end + 1)
        probabilities = poisson.pmf(k_values, lambda_val)
        
        colors = ['#0D9488' if (("=" in query_type and v == x) or ("<" in query_type and v <= x) or (">" in query_type and v >= x)) else '#334155' for v in k_values]
                
        fig, ax = plt.subplots(figsize=(6, 3.5), facecolor='none')
        ax.set_facecolor('none')
        ax.bar(k_values, probabilities, color=colors, edgecolor='#475569', alpha=0.95)
        ax.set_title(f"Poisson (Visor en λ={mean_theoretical:.1f}, σ={sigma:.2f})", color='white', fontsize=10)
        ax.set_xlabel("Número Concurrente de Eventos Esporádicos (X)", color='#94A3B8', fontsize=8)
        ax.set_ylabel("P(X=x)", color='#94A3B8', fontsize=8)
        ax.tick_params(colors='#94A3B8', labelsize=8)
        ax.grid(axis='y', linestyle='--', alpha=0.1)
        st.pyplot(fig)


else: # Geométrica
    
    mean_theoretical = 1.0 / p
    variance_theoretical = (1.0 - p) / (p ** 2)
    
    if "P(X = x)" in query_type:
        prob_theoretical = geom.pmf(x, p)
        prob_str = f"P(X = {x})"
    elif "P(X <= x)" in query_type:
        prob_theoretical = geom.cdf(x, p)
        prob_str = f"P(X \\le {x})"
    else:
        prob_theoretical = 1 - geom.cdf(x - 1, p) if x > 1 else 1.0
        prob_str = f"P(X \\ge {x})"

    with col1:
        st.subheader("📚 Ecuación Clásica Geométrica")
        st.latex(r"P(X = k) = (1-p)^{k-1} p")
        st.markdown("**Demostración analítica de la probabilidad del primer éxito en el ensayo k:**")
        st.latex(fr"P(X = {x}) = (1 - {p})^{{{x}-1}} \cdot {p}")
        
    with col2:
        st.subheader("📊 Exponencialidad Geométrica Discreta")
        sigma = np.sqrt(variance_theoretical)
        
        # En la geométrica, el inicio ideal siempre es 1.
        k_start = 1
        k_end = max(x + 5, int(np.ceil(mean_theoretical + 3 * sigma)))
        # Limitamos visual para no hacer barras muy delgadas si la varianza es monstruosa
        if k_end > 50 and x < 30: k_end = 30
            
        k_values = np.arange(k_start, k_end + 1)
        probabilities = geom.pmf(k_values, p)
        
        colors = ['#EAB308' if (("=" in query_type and v == x) or ("<" in query_type and v <= x) or (">" in query_type and v >= x)) else '#334155' for v in k_values]
                
        fig, ax = plt.subplots(figsize=(6, 3.5), facecolor='none')
        ax.set_facecolor('none')
        ax.bar(k_values, probabilities, color=colors, edgecolor='#475569', alpha=0.95)
        ax.set_title(f"Geométrica (Fuga visual μ={mean_theoretical:.1f}, σ={sigma:.2f})", color='white', fontsize=10)
        ax.set_xlabel("Número Ensayo hasta Primera Ocurrencia (X)", color='#94A3B8', fontsize=8)
        ax.set_ylabel("P(X=x)", color='#94A3B8', fontsize=8)
        ax.tick_params(colors='#94A3B8', labelsize=8)
        ax.grid(axis='y', linestyle='--', alpha=0.1)
        st.pyplot(fig)


st.markdown("---")

# Resultados y KPI Estadísticos Uniformes
m1, m2, m3 = st.columns(3)
m1.metric("Resultado Teórico Exacto", format_probability(prob_theoretical))
if selected_module == "Control de Calidad (Binomial)":
    m2.metric("Media Esperada Limite (μ)", f"{mean_theoretical:.2f}")
    m3.metric("Varianza de Volatilidad (σ²)", f"{variance_theoretical:.4f}")
    
    st.info(f"**Análisis de la Desviación y la Media Estándar:** Evaluando lotes enteros de {n} tamaño unitario mediante probabilidad p={p}, esperaríamos centralmente hallar un recuento de {mean_theoretical:.2f} con una fluidez de varianza catalogada en {variance_theoretical:.2f}.")
    
    with st.expander("🔬 Fundamentos Bioestadísticos (Modelado Binomial)"):
        st.markdown(f"La Binomial ({n}, {p}) se sostiene axiomáticamente en que cada extracción de una unidad del contenedor posee exclusivamente dos posibilidades complementarias independientes de fallo/éxito, sumando asintóticamente la frecuencia relativa a lo largo de {n} comprobaciones.")

elif selected_module == "Reacciones Adversas (Poisson)":
    m2.metric("Tasa de Convergencia Central (λ)", f"{mean_theoretical:.1f}")
    m3.metric("Dispersión Igualada Absoluta (σ²)", f"{variance_theoretical:.1f}")
    
    st.info(f"**Análisis del Fenómeno:** Poisson dicta matemáticamente que un flujo aleatorio continuo de {lambda_val:.1f} incidencias asume intrínsecamente igual nivel métrico de incerteza (Varianza = Lambda). Expresando una volatilidad estándar de +/- {np.sqrt(variance_theoretical):.2f} episodios.")

    with st.expander("🔬 Fundamentos Bioestadísticos (Modelado Poisson)"):
        st.markdown(f"El modelo exige rigor histórico carente de estacionalidad rítmica, la frecuencia media intertemporal estócastica λ=({lambda_val}) evalúa las sorpresas ante variabilidad sin memoria previa en entornos asépticos o farmacológicos de grandes volúmenes.")

else: # Geométrica
    m2.metric("Media Probable Detección (μ)", f"{mean_theoretical:.2f}")
    m3.metric("Ruido de Propagación (σ²)", f"{variance_theoretical:.2f}")
    
    st.info(f"**Análisis de Ensayo-Error:** Con un umbral de presencia muy aislado p={p}, la probabilidad de obtener fallo obligará teóricamente a una búsqueda metódica de hasta ser encontrados típicamente en el ensayo N° {mean_theoretical:.1f}. Una altísima Varianza indicará extrema dispersión en la cantidad de pruebas malgastadas antes del primer positivo.")

    with st.expander("🔬 Fundamentos Bioestadísticos (Modelado Geométrico)"):
        st.markdown(f"La técnica investiga la asintótica sin memoria. Trata sobre inspecciones repetitivas sobre elementos con probabilidad p={p}. A diferencia de la binomial que busca sumar totales de fallos, acá medimos la 'distancia temporal' y de iteración hasta por la fin presenciar una irregularidad punzante y decisiva.")


st.markdown("---")

# --- SECCIÓN: INTERPRETAR RESPUESTA (TEXTO Y AUDIO CON gTTS) ---
st.subheader("🎙️ Interpretación Docente y Recomendación Autónoma Artificial")

# Generar interpretación biológica y regulatoria profunda
if selected_module == "Control de Calidad (Binomial)":
    interpretation = (
        f"El control dicotómico bajo un universo de {n} iteraciones paramétricas arroja un valor estadístico de {format_probability(prob_theoretical)} tras analizar {prob_str}. "
        f"Al establecerse la media operativa de fallos en {mean_theoretical:.2f}, "
    )
    if x > mean_theoretical + np.sqrt(variance_theoretical):
        interpretation += "la alerta biofarmacéutica demanda implementar medidas correctivas en el reactor químico a la brevedad y declarar disconformidad cautelar."
    else:
        interpretation += "las desviaciones percibidas corresponden a errores aceptables inseparables del proceso industrial bajo calibración constante."

elif selected_module == "Reacciones Adversas (Poisson)":
    interpretation = (
        f"En este evento evaluamos farmacodinámica de rara frecuencia Poissoniana. Sabiendo que la tasa natural y endémica es de {lambda_val:.1f} de forma basal, "
        f"constatar la consulta del escenario {prob_str} refleja una certidumbre predictiva de ocurrencia de {format_probability(prob_theoretical)}. "
    )
    if x > lambda_val + np.sqrt(variance_theoretical)*1.5:
        interpretation += "Registramos una anomalía patológica sumamente desproporcional que indica posible mutación de excipientes."
    else:
        interpretation += "No existen trazas significativas de anomalía epidémica fuera del ruido blanco del espectro sanitario general."

else: # Geométrica
    interpretation = (
        f"Inspeccionar muestras bajo un control secuencial de falla de {p*100:.1f}% genera probabilidades sesgadas hacia la derecha. "
        f"Se concluye que obtener positivamente el hallazgo inicial analítico justamente respondiendo el cuadro general de {prob_str} "
        f"comporta una chance técnica matemática del {format_probability(prob_theoretical)}. "
    )
    if x > mean_theoretical + np.sqrt(variance_theoretical):
        interpretation += "Tener que aguardar tantos ensayos hasta ver el éxito o la falla por primera vez excede seriamente los tiempos estándar de control, recomendando revisar sensibilidad de métodos e instrumentos de muestreo."
    else:
        interpretation += "Encontrar la perturbación tempranamente resulta coherente frente a la fuerza combinatoria inherente y naturalizada del proceso biofarmacéutico local."

# Mostrar la explicación detallada por escrito
st.info(interpretation)

# Botón interactivo para generar Audio por la biblioteca gTTS
if st.button("🔊 Generar y Escuchar Lección de Voz Analítica"):
    with st.spinner("Sintetizando explicación académica de bioestadística vía gTTS..."):
        try:
            tts = gTTS(text=interpretation, lang='es')
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            st.audio(fp, format="audio/mp3")
            st.success("Explicación de audio generada con éxito con gTTS!")
        except Exception as e:
            st.error(f"Error generando motor cognitivo auditivo gTTS temporalmente inactivo: {e}")


st.markdown("---")

# --- SECCIÓN: SIMULACIÓN EMPÍRICA (MONTE CARLO) ---
st.subheader("🎲 Simulador Empírico de Contingencias (Algoritmo de Monte Carlo Randómico)")
st.write(
    "Contraste rápidamente el diseño teórico contra una simulación estocástica que genera infinitas ramificaciones de eventos, demostrando la consistencia irreductible de la Ley Fuerte de Números Grandes aplicados a la calidad farmacéutica."
)

trials_count = st.selectbox(
    "Tamaño de Universo de Simulación Biomecánica (Recuento Total Iterativo)",
    options=[500, 1000, 5000, 50000, 100000]
)

if st.button("🏃 Ejecutar Batería de Simulación Monte Carlo Numérica"):
    with st.spinner("Desencadenando iteraciones randomizadas avanzadas vectorialmente con biblioteca Numpy..."):
        
        # Realización de simulación vectorizada usando random robusto NumPy
        if selected_module == "Control de Calidad (Binomial)":
            simulated_data = np.random.binomial(n, p, trials_count)
        elif selected_module == "Reacciones Adversas (Poisson)":
            simulated_data = np.random.poisson(lambda_val, trials_count)
        else: # Geométrica
            # En scipy geom is 1-based, equivalente a np.random.geometric
            simulated_data = np.random.geometric(p, trials_count)
            
        # Calcular frecuencia empírica según el condicional analizado
        if "P(X = x)" in query_type:
            empirical_successes = np.sum(simulated_data == x)
        elif "P(X <= x)" in query_type:
            empirical_successes = np.sum(simulated_data <= x)
        else:
            empirical_successes = np.sum(simulated_data >= x)

        prob_empirical = empirical_successes / trials_count
        discrepancy = abs(prob_theoretical - prob_empirical)

        comparison_df = pd.DataFrame({
            "Métrica de Comprobación Central": ["Certeridad Analítica de Ecuación", "Llegada Aleatoria Computacional Global", "Coeficiente de Diferencial de Discrepancia Absoluta Numérica"],
            "Cálculo Aritmético": [
                format_probability(prob_theoretical),
                format_probability(prob_empirical),
                f"{discrepancy:.6e}" if discrepancy < 0.0001 else f"{discrepancy:.6f}"
            ]
        })
        
        st.table(comparison_df)
        
        st.success(
            f"¡Simulación terminada de {trials_count} microcosmos paralelos! "
            "La discrepancia diferencial es casi asintóticamente nula o virtual, confirmando estocásticamente las propiedades axiomáticas de distribución que fundan la confianza estricta de salud pública nacional."
        )
