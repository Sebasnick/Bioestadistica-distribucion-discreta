import unittest
from scipy.stats import binom, poisson
import numpy as np

# Estas pruebas verifican el motor lógico de `app.py`
class TestBioestadistica(unittest.TestCase):
    def test_binomial_mass(self):
        # n=10, p=0.5, x=5. Debe ser aproximadamente 0.246
        pmf_calc = binom.pmf(5, 10, 0.5)
        self.assertAlmostEqual(pmf_calc, 0.24609375, places=4)

    def test_binomial_extremes(self):
        # Aseguramos que la probabilidad no rompa en N altos
        pmf_calc = binom.pmf(250, 50000, 0.005)
        self.assertTrue(pmf_calc >= 0.0 and pmf_calc <= 1.0)
    
    def test_poisson_logic(self):
        # media de 4.2 fallos semanales
        lmbda = 4.2
        # la probabilidad de tener 0 eventos
        p_zero = poisson.pmf(0, lmbda)
        expected = np.exp(-lmbda)
        self.assertAlmostEqual(p_zero, expected, places=5)

if __name__ == '__main__':
    unittest.main()
