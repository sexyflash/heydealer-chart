/**
 * PriceChart - A highly customizable and responsive chart for visualizing vehicle price trends.
 * 
 * This class creates an interactive price chart using D3.js for data visualization.
 * It supports custom configurations, responsive design, and provides features like
 * tooltips, trend lines, and animated selections.
 *
 * @class
 */
class PriceChart {
    /**
     * Default configuration for the chart.
     * These can be overridden by passing custom config to the constructor.
     * 
     * @static
     * @type {Object}
     */
    static DEFAULT_CONFIG = {
        SPOT_RADIUS: 6.5,
        SPOT_COLOR: 'rgba(57, 110, 255, 0.31)',
        SELECTED_SPOT_COLOR: '#628CFF',
        TREND_LINE_COLOR: '#396EFF',
        TREND_LINE_WIDTH: 6,
        ANIMATION_DURATION: 1.5,
        MIN_PRICE: 1200,
        MAX_PRICE: 2100,
        MIN_MILEAGE: 2,
        MAX_MILEAGE: 25,
        PRICE_STEP: 200,
        MILEAGE_STEPS: [0, 5, 10, 15, 20, 25],
        title: 'Estimated Vehicle Price',
        modelName: '2014 4WD KV300',
        yAxisUnit: 'k',
        xAxisUnit: 'k mi',
        yAxisFormat: (value) => `${Math.floor(value / 1000)}`,
        xAxisFormat: (value) => value === 0 ? '0' : `${value}`,
        tooltipPriceFormat: (value) => `${Math.floor(value / 1000)}`,
        tooltipMileageFormat: (value) => value.toFixed(1),
        rangeFormat: (min, max) => `${Math.floor(min / 1000)} ~ ${Math.ceil(max / 1000)}`
    };

    /**
     * Creates an instance of PriceChart.
     * 
     * @param {Object} options - Configuration options for the chart
     * @param {string} options.containerId - ID of the container element
     * @param {Object} [options.config] - Custom configuration to override defaults
     */
    constructor(options) {
        this.container = document.getElementById(options.containerId);
        if (!this.container) {
            throw new Error(`Container with id "${options.containerId}" not found`);
        }

        this.config = { ...PriceChart.DEFAULT_CONFIG, ...options.config };
        this.initialize();
    }

    /**
     * Initializes the chart by loading data and SVG, then rendering.
     * 
     * @private
     */
    async initialize() {
        try {
            const [data, spotSvg] = await Promise.all([this.loadData(), this.loadSpotSVG()]);
            this.pricePoints = data.pricePoints;
            this.currentPoint = data.currentPoint;
            this.spotSvg = spotSvg;
            this.initializeChart();
            this.render();
            window.addEventListener('resize', () => this.render());
        } catch (error) {
            console.error('Failed to initialize chart:', error);
        }
    }

    /**
     * Loads price data from a JSON file or generates random data if file is not found.
     * 
     * @private
     * @returns {Promise<Object>} Resolved with price points and current point
     */
    async loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            console.log('Loaded data:', data);
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            const pricePoints = this.generatePricePoints();
            return {
                pricePoints,
                currentPoint: this.selectRandomPoint(pricePoints)
            };
        }
    }

    /**
     * Initializes the chart structure by creating necessary DOM elements.
     * 
     * @private
     */
    initializeChart() {
        this.container.classList.add('price-chart');
        this.container.innerHTML = `
            <div class="price-chart__content">
                <div class="price-chart__header">
                    <h1 class="price-chart__title">${this.config.title}</h1>
                    <div class="price-chart__range"></div>
                    <div class="price-chart__unit">${this.config.yAxisUnit}</div>
                </div>
                <div class="price-chart__model-info">
                    <div class="price-chart__model-icon"></div>
                    <div class="price-chart__model-name">${this.config.modelName}</div>
                </div>
                <div class="price-chart__graph">
                    <div class="price-chart__y-axis"></div>
                    <div class="price-chart__x-axis"></div>
                    <div class="price-chart__plot-area">
                        <svg class="price-chart__trend-line"></svg>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generates random price points for demonstration purposes.
     * 
     * @private
     * @returns {Array<Object>} Array of price points
     */
    generatePricePoints() {
        const count = Math.floor(Math.random() * (100 - 80 + 1)) + 80;
        return Array.from({ length: count }, () => {
            const mileage = Math.random() * (this.config.MAX_MILEAGE - this.config.MIN_MILEAGE) + this.config.MIN_MILEAGE;
            const price = Math.max(this.config.MIN_PRICE, this.config.MAX_PRICE - (mileage * 50) + (Math.random() * 400 - 200));
            return { mileage, price: price * 10000 };
        }).sort((a, b) => a.mileage - b.mileage);
    }

    /**
     * Selects a random point from the price points.
     * 
     * @private
     * @param {Array<Object>} pricePoints - Array of price points
     * @returns {Object} Randomly selected price point
     */
    selectRandomPoint(pricePoints) {
        return pricePoints[Math.floor(Math.random() * pricePoints.length)];
    }

    /**
     * Calculates the chart range based on the price points.
     * 
     * @private
     * @returns {Object} Chart range object
     */
    getChartRange() {
        const mileages = this.pricePoints.map(p => p.mileage);
        const prices = this.pricePoints.map(p => p.price);
        
        const minMileage = Math.min(...mileages);
        const maxMileage = Math.max(...mileages);
        const maxPrice = Math.max(...prices);
        
        const mileageRange = maxMileage - minMileage;
        const priceRange = maxPrice;
        
        return {
            minMileage: Math.max(0, minMileage - mileageRange * 0.15),
            maxMileage: maxMileage + mileageRange * 0.15,
            minPrice: 0,
            maxPrice: Math.ceil((maxPrice + priceRange * 0.15) / 10000000) * 10000000
        };
    }

    /**
     * Renders the entire chart.
     * 
     * @public
     */
    render() {
        const range = this.getChartRange();
        this.renderYAxis(range);
        this.renderXAxis(range);
        this.renderSpots(range);
        this.renderTrendLine(range);
        this.updatePriceRange();
    }

    /**
     * Renders the Y-axis of the chart.
     * 
     * @private
     * @param {Object} range - Chart range object
     */
    renderYAxis(range) {
        const yAxis = this.container.querySelector('.price-chart__y-axis');
        yAxis.innerHTML = '';
        const step = range.maxPrice / 4;
        for (let i = 4; i >= 0; i--) {
            const price = Math.round(i * step / 100) * 100;
            const group = document.createElement('div');
            group.innerHTML = `
                <div class="price-chart__y-axis-label">${this.config.yAxisFormat(price)}${this.config.yAxisUnit}</div>
                <div class="price-chart__y-axis-line"></div>
            `;
            yAxis.appendChild(group);
        }

        const chartWidth = this.container.querySelector('.price-chart__content').offsetWidth;
        const yAxisLines = this.container.querySelectorAll('.price-chart__y-axis-line');
        yAxisLines.forEach(line => {
            line.style.width = `${(chartWidth - 80) * 0.9}px`;
        });
    }

    /**
     * Renders the X-axis of the chart.
     * 
     * @private
     * @param {Object} range - Chart range object
     */
    renderXAxis(range) {
        const xAxis = this.container.querySelector('.price-chart__x-axis');
        xAxis.innerHTML = '';
        const steps = this.config.MILEAGE_STEPS;
        const chartWidth = this.container.querySelector('.price-chart__content').offsetWidth;
        const xAxisWidth = (chartWidth - 80) * 0.9;
        xAxis.style.width = `${xAxisWidth}px`;
        steps.forEach((step, index) => {
            const group = document.createElement('div');
            const stepPosition = index / (steps.length - 1);
            group.style.left = `${stepPosition * 100}%`;
            group.innerHTML = `
                <div class="price-chart__x-axis-label">${this.config.xAxisFormat(step)}${step > 0 ? this.config.xAxisUnit : ''}</div>
                <div class="price-chart__x-axis-tick"></div>
            `;
            xAxis.appendChild(group);
        });

        const lastYAxisLine = this.container.querySelector('.price-chart__y-axis > div:last-child .price-chart__y-axis-line');
        const lastYAxisLineRect = lastYAxisLine.getBoundingClientRect();
        const graphRect = this.container.querySelector('.price-chart__graph').getBoundingClientRect();
        const xAxisTickHeight = this.container.querySelector('.price-chart__x-axis-tick').offsetHeight;
        xAxis.style.top = `${lastYAxisLineRect.bottom - graphRect.top - xAxisTickHeight}px`;
    }

    /**
     * Renders the price spots on the chart.
     * 
     * @private
     * @param {Object} range - Chart range object
     */
    renderSpots(range) {
        const plotArea = this.container.querySelector('.price-chart__plot-area');
        plotArea.innerHTML = '<svg class="price-chart__trend-line"></svg>';
        const svg = plotArea.querySelector('.price-chart__trend-line');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        
        const xAxisTop = parseFloat(this.container.querySelector('.price-chart__x-axis').style.top);
        const plotAreaRect = plotArea.getBoundingClientRect();
        
        this.pricePoints.forEach(point => {
            const spot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const spotX = ((point.mileage - range.minMileage) / (range.maxMileage - range.minMileage)) * 100;
            const spotY = 100 - (point.price / range.maxPrice) * 100;
            spot.setAttribute('cx', `${spotX}%`);
            spot.setAttribute('cy', `${spotY}%`);
            spot.setAttribute('r', this.config.SPOT_RADIUS);
            spot.setAttribute('fill', this.config.SPOT_COLOR);
            spot.setAttribute('class', 'price-chart__spot');
            spot.setAttribute('data-mileage', point.mileage);
            spot.setAttribute('data-price', point.price);
            svg.appendChild(spot);

            if (point.mileage === this.currentPoint.mileage && point.price === this.currentPoint.price) {
                this.renderSelectedSpot(svg, spotX, spotY, xAxisTop, plotAreaRect);
            }
        });

        this.addTooltipListeners(svg);
    }

    /**
     * Renders the selected spot with additional visual elements.
     * 
     * @private
     * @param {SVGElement} svg - The SVG element
     * @param {number} spotX - X position of the spot
     * @param {number} spotY - Y position of the spot
     * @param {number} xAxisTop - Top position of X-axis
     * @param {DOMRect} plotAreaRect - Bounding rectangle of plot area
     */
    renderSelectedSpot(svg, spotX, spotY, xAxisTop, plotAreaRect) {
        if (!this.spotSvg) {
            console.error('Spot SVG not found');
            return;
        }

        const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        verticalLine.setAttribute('x1', `${spotX}%`);
        verticalLine.setAttribute('y1', `${spotY}%`);
        verticalLine.setAttribute('x2', `${spotX}%`);
        verticalLine.setAttribute('y2', `${(xAxisTop / plotAreaRect.height) * 100}%`);
        verticalLine.setAttribute('stroke', this.config.SELECTED_SPOT_COLOR);
        verticalLine.setAttribute('stroke-width', '1');
        verticalLine.setAttribute('stroke-dasharray', '2,2');
        svg.appendChild(verticalLine);

        const currentSpot = this.spotSvg.cloneNode(true);
        currentSpot.style.display = 'block';
        currentSpot.removeAttribute('id');

        const spotWidth = parseFloat(currentSpot.getAttribute('width') || 28);
        const spotHeight = parseFloat(currentSpot.getAttribute('height') || 42);

        const spotSvgX = spotX - (spotWidth / (2 * plotAreaRect.width) * 100);
        const spotSvgY = spotY - (spotHeight / plotAreaRect.height * 100);

        currentSpot.setAttribute('x', `${spotSvgX}%`);
        currentSpot.setAttribute('y', `${spotSvgY}%`);
        currentSpot.removeAttribute('transform');

        svg.appendChild(currentSpot);

        const animatedCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        animatedCircle.setAttribute('cx', `${spotX}%`);
        animatedCircle.setAttribute('cy', `${spotY}%`);
        animatedCircle.setAttribute('r', '10');
        animatedCircle.setAttribute('fill', this.config.SELECTED_SPOT_COLOR);
        animatedCircle.setAttribute('opacity', '0.5');
        svg.appendChild(animatedCircle);

        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'r');
        animate.setAttribute('from', '10');
        animate.setAttribute('to', '30');
        animate.setAttribute('dur', `${this.config.ANIMATION_DURATION}s`);
        animate.setAttribute('repeatCount', 'indefinite');
        animatedCircle.appendChild(animate);

        const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateOpacity.setAttribute('attributeName', 'opacity');
        animateOpacity.setAttribute('from', '0.5');
        animateOpacity.setAttribute('to', '0');
        animateOpacity.setAttribute('dur', `${this.config.ANIMATION_DURATION}s`);
        animateOpacity.setAttribute('repeatCount', 'indefinite');
        animatedCircle.appendChild(animateOpacity);

        const mileageText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mileageText.setAttribute('x', `${spotX}%`);
        mileageText.setAttribute('y', `${(xAxisTop / plotAreaRect.height) * 100 + 5}%`);
        mileageText.setAttribute('text-anchor', 'middle');
        mileageText.setAttribute('fill', this.config.SELECTED_SPOT_COLOR);
        mileageText.setAttribute('font-weight', 'bold');
        mileageText.setAttribute('font-size', '22px');
        mileageText.textContent = `${this.config.tooltipMileageFormat(this.currentPoint.mileage)}${this.config.xAxisUnit}`;
        svg.appendChild(mileageText);

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.appendChild(verticalLine);
        group.appendChild(animatedCircle);
        group.appendChild(mileageText);
        group.appendChild(currentSpot);
        svg.appendChild(group);
    }

    /**
     * Adds tooltip listeners to the spots on the chart.
     * 
     * @private
     * @param {SVGElement} svg - The SVG element containing the spots
     */
    addTooltipListeners(svg) {
        const spots = svg.querySelectorAll('.price-chart__spot');
        let tooltip = this.container.querySelector('.price-chart__tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'price-chart__tooltip';
            this.container.appendChild(tooltip);
        }

        spots.forEach(spot => {
            spot.addEventListener('mouseenter', (e) => {
                const mileage = parseFloat(spot.getAttribute('data-mileage'));
                const price = parseFloat(spot.getAttribute('data-price'));
                tooltip.innerHTML = `
                    <div class="price-chart__tooltip-content">
                        <div class="price-chart__tooltip-price">${this.formatNumber(this.config.tooltipPriceFormat(price))}${this.config.yAxisUnit}</div>
                        <div class="price-chart__tooltip-mileage">${this.config.tooltipMileageFormat(mileage)}${this.config.xAxisUnit}</div>
                    </div>
                    <div class="price-chart__tooltip-arrow"></div>
                `;
                const rect = spot.getBoundingClientRect();
                const containerRect = this.container.getBoundingClientRect();
                tooltip.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - containerRect.top - tooltip.offsetHeight - 10}px`;
                tooltip.style.display = 'block';
            });

            spot.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        });
    }

    /**
     * Renders the trend line on the chart.
     * 
     * @private
     * @param {Object} range - Chart range object
     */
    renderTrendLine(range) {
        const svg = this.container.querySelector('.price-chart__trend-line');
        const width = svg.clientWidth;
        const height = svg.clientHeight;

        const xValues = this.pricePoints.map(p => p.mileage);
        const yValues = this.pricePoints.map(p => p.price);
        
        const coefficients = this.calculatePolynomialRegression(xValues, yValues, 2);

        const xScale = d3.scaleLinear()
            .domain([range.minMileage, range.maxMileage])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, range.maxPrice])
            .range([height, 0]);

        const line = d3.line()
            .x(d => xScale(d))
            .y(d => yScale(this.polynomialFunction(coefficients, d)))
            .curve(d3.curveBasis);

        const trendLinePoints = d3.range(range.minMileage, range.maxMileage, (range.maxMileage - range.minMileage) / 100);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', line(trendLinePoints));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', this.config.TREND_LINE_COLOR);
        path.setAttribute('stroke-width', this.config.TREND_LINE_WIDTH);
        svg.appendChild(path);
    }

    /**
     * Calculates polynomial regression coefficients.
     * 
     * @private
     * @param {Array<number>} xValues - X values
     * @param {Array<number>} yValues - Y values
     * @param {number} degree - Degree of polynomial
     * @returns {Array<number>} Coefficients of polynomial
     */
    calculatePolynomialRegression(xValues, yValues, degree) {
        const n = xValues.length;
        const matrix = Array(degree + 1).fill().map(() => Array(degree + 1).fill(0));
        const vector = Array(degree + 1).fill(0);

        for (let i = 0; i <= degree; i++) {
            for (let j = 0; j <= degree; j++) {
                matrix[i][j] = xValues.reduce((sum, x) => sum + Math.pow(x, i + j), 0);
            }
            vector[i] = xValues.reduce((sum, x, k) => sum + Math.pow(x, i) * yValues[k], 0);
        }

        return this.gaussianElimination(matrix, vector);
    }

    /**
     * Performs Gaussian elimination to solve linear equations.
     * 
     * @private
     * @param {Array<Array<number>>} matrix - Coefficient matrix
     * @param {Array<number>} vector - Constant vector
     * @returns {Array<number>} Solution vector
     */
    gaussianElimination(matrix, vector) {
        const n = vector.length;
        for (let i = 0; i < n; i++) {
            let maxEl = Math.abs(matrix[i][i]);
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(matrix[k][i]) > maxEl) {
                    maxEl = Math.abs(matrix[k][i]);
                    maxRow = k;
                }
            }

            for (let k = i; k < n; k++) {
                const tmp = matrix[maxRow][k];
                matrix[maxRow][k] = matrix[i][k];
                matrix[i][k] = tmp;
            }
            const tmp = vector[maxRow];
            vector[maxRow] = vector[i];
            vector[i] = tmp;

            for (let k = i + 1; k < n; k++) {
                const c = -matrix[k][i] / matrix[i][i];
                for (let j = i; j < n; j++) {
                    if (i === j) {
                        matrix[k][j] = 0;
                    } else {
                        matrix[k][j] += c * matrix[i][j];
                    }
                }
                vector[k] += c * vector[i];
            }
        }

        const solution = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            solution[i] = vector[i] / matrix[i][i];
            for (let k = i - 1; k >= 0; k--) {
                vector[k] -= matrix[k][i] * solution[i];
            }
        }

        return solution;
    }

    /**
     * Calculates the y-value for a given x-value using the polynomial function.
     * 
     * @private
     * @param {Array<number>} coefficients - Coefficients of polynomial
     * @param {number} x - X value
     * @returns {number} Y value
     */
    polynomialFunction(coefficients, x) {
        return coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0);
    }

    /**
     * Updates the price range display.
     * 
     * @private
     */
    updatePriceRange() {
        const priceRange = this.container.querySelector('.price-chart__range');
        const min = Math.min(...this.pricePoints.map(p => p.price));
        const max = Math.max(...this.pricePoints.map(p => p.price));
        priceRange.textContent = this.formatNumber(this.config.rangeFormat(min, max));
    }

    /**
     * Formats a number with thousands separator.
     * 
     * @private
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Loads the SVG for the spot icon.
     * 
     * @private
     * @returns {Promise<SVGElement>} Promise that resolves with the loaded SVG element
     */
    async loadSpotSVG() {
        try {
            const response = await fetch('spot.svg');
            const svgContent = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            const spotElement = svgDoc.querySelector('svg');
            if (!spotElement) {
                throw new Error('SVG element not found in spot.svg');
            }
            spotElement.setAttribute('viewBox', '0 0 28 42');
            return spotElement;
        } catch (error) {
            console.error('Error loading spot.svg:', error);
            return this.createFallbackSpot();
        }
    }

    /**
     * Creates a fallback spot icon if the SVG fails to load.
     * 
     * @private
     * @returns {SVGElement} Fallback spot SVG element
     */
    createFallbackSpot() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '28');
        svg.setAttribute('height', '42');
        svg.setAttribute('viewBox', '0 0 28 42');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '14');
        circle.setAttribute('cy', '21');
        circle.setAttribute('r', '14');
        circle.setAttribute('fill', this.config.SELECTED_SPOT_COLOR);
        
        svg.appendChild(circle);
        return svg;
    }
}

/*
// Initialize the chart when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new PriceChart({
        containerId: 'chart-container',
        config: {
            // Custom configuration options can be added here
            // They will override the default configuration
        }
    });
});
*/