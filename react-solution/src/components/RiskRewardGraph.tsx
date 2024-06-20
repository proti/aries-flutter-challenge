import './RiskRewardGraph.css';
import { FC, useEffect, useState } from 'react';
import { PositionType, OptionType, OptionContract } from '../data/OptionType';
import * as d3 from 'd3';

type Props = {
    options: Array<OptionContract>
}

const MAX_OPTIONS = 4;
const GRAPH_BG_COLOR = "#FFF9DE";
const GRAPH_LINE_COLOR = "#A6D0DD";
const GRAPH_DOT_COLOR = "#028391";
const GRAPH_LINE_OFFSET = 0.5; //Adjust if need more space

const RiskRewardGraph: FC<Props> = ({ options }) => {

    const [graphData, setGraphData] = useState<GraphData>([]);
    const [error, setError] = useState<string | null>()

    useEffect(() => {
        if (!options || options.length <= MAX_OPTIONS) {
            setGraphData(options.map(({ strike_price }) => ({
                price: strike_price,
                payOff: calculatePayOff(strike_price),
            })));

        } else {
            setError(`Please enter a valid array with up to ${MAX_OPTIONS} options contracts.`);
        }
        return () => { }
    }, [options]);

    useEffect(() => {
        renderGraph();
        return () => { }
    }, [graphData]);


    const calculatePayOff = (price: number): number => {
        let payoff = 0;
        options.forEach(({ strike_price, type, bid, ask, long_short }) => {
            //cost of buying or selling the option
            const premium = (bid + ask) / 2;
            //position taken
            const position = long_short === PositionType.LONG ? 1 : -1;
            //determine the intrinsic value for Call, Put options
            if (type === OptionType.CALL) {
                //substract premium = net payoff per option
                //set to 0 if value negative
                payoff += position * (Math.max(price - strike_price, 0) - premium);
            } else {
                payoff += position * (Math.max(strike_price - price, 0) - premium);
            }
        });
        return payoff;
    };

    const maxProfit = () => Number(Math.max(...graphData.map(d => d.payOff)).toFixed(2));
    const maxLoss = () => Math.min(...graphData.map(d => d.payOff));

    const getConvertedValue = (inputValue: number) => {
        const newValue = inputValue < 0 ? inputValue.toString().split("-")[1] : inputValue;
        return inputValue < 0 ? `-$${newValue}` : `$${newValue}`;
    }


    const breakEvenPoints = () => options.map(({ strike_price, type, bid, ask, long_short }) => {
        //cost of buying or selling the option
        const premium = (bid + ask) / 2;

        let breakEvenPoint = 0;
        if (type === OptionType.CALL) {
            if (long_short === PositionType.LONG) {
                breakEvenPoint = strike_price + premium;
            } else {
                breakEvenPoint = strike_price - premium;
            }
        } else if (type === OptionType.PUT) {
            if (long_short === PositionType.LONG) {
                breakEvenPoint = strike_price - premium;
            } else {
                breakEvenPoint = strike_price + premium;
            }
        }
        return breakEvenPoint;
    }).join(",")

    const renderGraph = () => {
        //get min max price based on the data 
        const min = d3.min(options, d => d.strike_price)!;
        const max = d3.max(options, d => d.strike_price)!;

        const svg = d3.select('#graph')
            .attr('width', 600)
            .attr('height', 400)
            .style("stroke-linejoin", "round")
            .style('background-color', GRAPH_BG_COLOR);

        svg.selectAll('*').remove();

        const x = d3.scaleLinear()
            .domain([min - GRAPH_LINE_OFFSET, max])
            .range([50, 550]);

        const y = d3.scaleLinear()
            .domain([d3.min(graphData, d => d.payOff)! - GRAPH_LINE_OFFSET, d3.max(graphData, d => d.payOff)!])
            .range([350, 50]);

        const line = d3.line<{ price: number, payOff: number }>()
            .x(d => x(d.price))
            .y(d => y(d.payOff))
            .curve(d3.curveCatmullRom.alpha(1));

        svg.append('g')
            .attr('transform', 'translate(0,350)')
            .call(d3.axisBottom(x));

        svg.append('g')
            .attr('transform', 'translate(50,0)')
            .call(d3.axisLeft(y));

        //line
        svg.append('path')
            .datum(graphData)
            .attr('fill', 'none') //line/area fill
            .attr('stroke', GRAPH_LINE_COLOR)
            .attr('stroke-width', 3)
            .attr('d', line)

        //dots with tooltip
        svg.selectAll('dot')
            .data(graphData)
            .enter().append('circle')
            .attr('r', 4)
            .attr('cx', d => x(d.price))
            .attr('cy', d => y(d.payOff))
            .style('fill', GRAPH_DOT_COLOR)
            .on("mouseover", (evt, d) => {
                d3.select('#tooltip')
                    .classed("hidden", false)
                    .style("left", evt.pageX - 30 + "px")
                    .style("top", evt.pageY - 65 + "px")

                let newHtml: Array<string> = [];
                newHtml = [`<div class="tooltip-price"><span>Price:</span>&nbsp<span>$${d.price}</span></div>`];
                newHtml = [...newHtml, `<div class="tooltip-payoff"><span>Payoff:</span>&nbsp<span>${getConvertedValue(d.payOff)}</span></div>`];

                d3.select('#tooltip').html(newHtml.join(""))
            })
            .on("mouseout", () => d3.select('#tooltip').html('').classed("hidden", true));

    };

    return <> {error ||
        <section>
            <div id="tooltip" />
            <svg id="graph"></svg>
            <div>
                <h3>Metrics:</h3>
                <div>
                    <span className={maxProfit() < 0 ? 'maxProfit loss' : 'maxProfit'}>Max Profit: {getConvertedValue(maxProfit())}</span>
                    <span className="maxLoss">Max Loss: {getConvertedValue(maxLoss())}</span>
                </div>
                <p>Break-even points: {breakEvenPoints() || "none"}</p>
            </div>
        </section >}
    </>
}
export default RiskRewardGraph;