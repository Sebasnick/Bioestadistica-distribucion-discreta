# Simulador Bioestadístico: Modelos Binomial y Poisson

## 1. Identificación
**Tema elegido:** Distribuciones de Probabilidad en Bioestadística (Modelos Binomial y Poisson).  
**Objetivo de aprendizaje:** Comprender empíricamente las condiciones, supuestos y cálculos estocásticos detrás de los modelos discretos y su aplicación en la farmacovigilancia y el control de calidad biológico.

## 2. Requisitos y Modo de Uso
Para correr la aplicación (si cuenta con Python instalado localmente):
1. Instale las librerías: `pip install -r requirements.txt`
2. Ejecute Streamlit: `streamlit run app.py`

## 3. Modo de interacción y Requisitos cumplidos
- **Datos y Metodología:** La app recibe los parámetros (`n`, `p`, `x`, `\u03bb`) de forma interactiva. No tienen restricciones artificiales superiores, permitiendo modelos reales.
- **Simulaciones:** Ejecuta las distribuciones Binomial (PMF/CDF) y Poisson de forma matemática estricta apoyado por SciPy.
- **Explicación paso a paso:** Por cada cálculo, la interfaz detalla tanto la teoría estadística como su interpretación clínica bioestadística (sección de informes desplegables).
- **Interpretación Comprensible:** En la pantalla se visualizan interpretaciones humanas (qué significan los resultados para un hospital o lote industrial).
- **Visualización:** Integra simulaciones visuales matplotlib/altair o la provista por la interfaz de Streamlit, adaptándose al parámetro límite.

## 4. Estructura del repositorio

\`\`\`
proyecto_bioestadistica/
|-- app.py                 # Aplicación principal interactiva (Streamlit)
|-- README.md              # Explicación general y modo de uso
|-- requirements.txt       # Librerías (streamlit, numpy, scipy)
|-- ejemplos/              # Datos y guías de ejercicios bioestadísticos
|-- pruebas/               # Scripts de testing matemáticos (asserts)
`-- informe_breve.md       # Informe académico resumido (Sustituto de PDF en entornos nube)
\`\`\`
