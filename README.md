# HeyDealer Price Chart

## Introduction

The HeyDealer Price Chart is a sophisticated, highly customizable, and responsive chart solution for visualizing vehicle price trends. Inspired by the HeyDealer app, this chart is implemented in pure JavaScript and can be seamlessly integrated into various web applications. Whether you're building a car dealership website, a vehicle valuation tool, or any application that requires visualization of price data over time or mileage, the HeyDealer Price Chart offers a powerful and flexible solution.

## Features

- **Responsive Design**: Adapts fluidly to different screen sizes and devices, ensuring a consistent user experience across desktops, tablets, and mobile phones.
- **High Customizability**: Offers a wide range of configuration options to tailor the chart's appearance and behavior to your specific needs.
- **Interactive Tooltips**: Provides detailed information for each data point on hover, enhancing user engagement and data comprehension.
- **Trend Line Visualization**: Utilizes polynomial regression to display a smooth trend line, offering insights into overall price trends.
- **Multilingual Support**: Easily adaptable for multiple languages and localization requirements.
- **Seamless Integration**: Designed to be easily integrated into existing web applications with minimal setup.
- **Performance Optimized**: Efficiently handles large datasets without compromising on performance.
- **Cross-Browser Compatibility**: Ensures consistent functionality across all modern web browsers.

## Installation

1. Clone this repository or download the source files:
   ```
   git clone https://github.com/yourusername/heydealer-price-chart.git
   ```

2. Include the necessary files in your project:
   ```html
   <link rel="stylesheet" href="path/to/styles.css">
   <script src="https://d3js.org/d3.v7.min.js"></script>
   <script src="path/to/chart.js"></script>
   ```

   Note: This project requires D3.js (version 7 or later) for certain calculations and visualizations.

## Usage

1. Create a container element in your HTML:
   ```html
   <div id="chart-container"></div>
   ```

2. Initialize the chart with custom configuration:
   ```javascript
   document.addEventListener('DOMContentLoaded', function() {
       new PriceChart({
           containerId: 'chart-container',
           config: {
               // Custom configuration options
           }
       });
   });
   ```

## Configuration Options

The `PriceChart` constructor accepts a configuration object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | 'Estimated Vehicle Price' | Chart title |
| `modelName` | string | '2014 4WD KV300' | Vehicle model name |
| `yAxisUnit` | string | 'k' | Unit for Y-axis (price) |
| `xAxisUnit` | string | 'k mi' | Unit for X-axis (mileage) |
| `minPrice` | number | 1200 | Minimum price value |
| `maxPrice` | number | 2100 | Maximum price value |
| `minMileage` | number | 1 | Minimum mileage value |
| `maxMileage` | number | 24 | Maximum mileage value |
| `mileageSteps` | array | [0, 5, 10, 15, 20, 25] | Mileage steps for X-axis |
| `yAxisFormat` | function | `value => \`${Math.floor(value / 1000)}\`` | Y-axis label format function |
| `xAxisFormat` | function | `value => value === 0 ? '0' : \`${value}\`` | X-axis label format function |
| `tooltipPriceFormat` | function | `value => \`${Math.floor(value / 1000)}\`` | Tooltip price format function |
| `tooltipMileageFormat` | function | `value => value.toFixed(1)` | Tooltip mileage format function |
| `rangeFormat` | function | `(min, max) => \`${Math.floor(min / 1000)} ~ ${Math.ceil(max / 1000)}\`` | Price range format function |

## Advanced Customization

### Styling

The appearance of the chart can be extensively customized by modifying the `styles.css` file or overriding styles in your own CSS. Here are some examples:

```css
/* Customizing the chart title */
.price-chart__title {
    color: #333;
    font-size: 28px;
    font-weight: bold;
    text-transform: uppercase;
}

/* Modifying the trend line */
.price-chart__trend-line {
    stroke: #ff6600;
    stroke-width: 3px;
    stroke-dasharray: 5, 5; /* Creates a dashed line */
}

/* Styling the data points */
.price-chart__spot {
    fill: rgba(0, 123, 255, 0.7);
    stroke: #fff;
    stroke-width: 2px;
}

/* Customizing the tooltip */
.price-chart__tooltip {
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    border-radius: 4px;
    padding: 10px;
}
```

### Localization

To create a localized version of the chart, you can customize the configuration options. Here's an example for a Japanese localization:

```javascript
new PriceChart({
    containerId: 'chart-container',
    config: {
        title: '内車予想時価',
        modelName: '2014年型 4WD KV300',
        yAxisUnit: '万円',
        xAxisUnit: '万km',
        yAxisFormat: value => `${Math.floor(value / 10000)}`,
        tooltipPriceFormat: value => `${Math.floor(value / 10000)}`,
        rangeFormat: (min, max) => `${Math.floor(min / 10000)} ~ ${Math.ceil(max / 10000)}`,
        mileageSteps: [0, 5, 10, 15, 20, 25],
        xAxisFormat: value => value === 0 ? '0' : `${value}`
    }
});
```

## Data Format

The chart expects data in the following JSON format:

```json
{
  "pricePoints": [
    {
      "mileage": 1.0,
      "price": 22487453
    },
    {
      "mileage": 1.1,
      "price": 20265853
    },
    // ... more data points
  ],
  "currentPoint": {
    "mileage": 4.9,
    "price": 18114266
  }
}
```

This data can be loaded from a JSON file or generated dynamically. The `pricePoints` array contains all the data points to be plotted on the chart, while the `currentPoint` object represents the specific point to be highlighted (e.g., the user's current vehicle).

## Performance Considerations

The HeyDealer Price Chart is designed to handle large datasets efficiently. However, for optimal performance, consider the following tips:

1. Limit the number of data points to around 100-200 for smooth rendering on most devices.
2. If dealing with larger datasets, consider implementing data aggregation or filtering on the server-side before sending to the client.
3. Utilize the `debounce` technique for window resize events to prevent excessive re-rendering on mobile devices.

## Browser Support

This chart is compatible with modern browsers that support ECMAScript 6 and SVG. It has been tested and confirmed to work on the latest versions of:

- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge

For older browsers, consider using appropriate polyfills or transpiling the code using a tool like Babel.

## Contributing

We welcome contributions to the HeyDealer Price Chart! If you'd like to contribute, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code adheres to the existing style conventions and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the innovative design of the HeyDealer app
- Utilizes [D3.js](https://d3js.org/) for advanced data visualization capabilities

## Support

If you encounter any issues or have questions about using the HeyDealer Price Chart, please open an issue on the GitHub repository. We'll do our best to provide timely support and address any concerns.

Thank you for using the HeyDealer Price Chart! We hope it proves to be a valuable tool for your projects.
