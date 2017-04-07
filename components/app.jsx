import React from 'react';
import cheerio from 'cheerio';
const $ = require('jquery');


export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            numForms: 3,
            viewPage: 0,
            '0': {
                item: '',
                maxPrice: '',
                minPrice: '',
                textFlag: false
            },
            '1': {
                item: '',
                maxPrice: '',
                minPrice: '',
                textFlag: false
            },
            '2': {
                item: '',
                maxPrice: '',
                minPrice: '',
                textFlag: false
            }
        };
        this.init();
    }

    addForm(e) {
        let num = this.state.numForms;
        this.setState({
            numForms: num + 1,
            [num]: {
                item: '',
                maxPrice: ''
            }
        });
    }

    init() {
        $.get('/data', (response) => {
            const temp = {};
            response.forEach((data, i) => {
                temp[i] = {
                    item: data.item,
                    maxPrice: (data.maxPrice === 'default' ? '' : data.maxPrice),
                    minPrice: (data.minPrice === 'default' ? '' : data.minPrice)
                }
            });
            temp.numForms = response.length < 3 ? 3 : response.length;
            this.setState(temp);
            if (this.state['0'].item) this.getData(0);
        })
    }

    setTextAlert(id) {
        const temp = this.state[id];
        temp.textFlag = true;
        temp.intervalKey = setInterval(this.getData.bind(this, id), 10000);
        this.setState(temp);
    }

    getData(id, e) {
        console.log(this.state[id]);
        if (e) e.preventDefault();
        if (!this.state[id].item) {
            alert('Input Item Name!');
            return;
        }
        const maxPrice = (this.state[id].maxPrice ? this.state[id].maxPrice : 'default');
        const minPrice = (this.state[id].minPrice ? this.state[id].minPrice : 'default');
        let url = '/craigslist/' + this.state[id].item + '/' + maxPrice + '/' + minPrice;

        $.get(url, (response) => {
            const itemName = this.state[id].item;
            if (this.state[id].textFlag && response.results.length === 0) return;
            else if (this.state[id].textFlag && response.results.length > 0) {
                $.post('/text', { item: itemName }, (response) => {
                    console.log(response);
                });
            } console.log(response);
            let temp = this.state[id];
            temp.results = response.results;
            temp.textFlag = false;
            clearInterval(temp.intervalKey);
            this.setState({
                viewPage: id,
                [id]: temp
            });
        }, 'json');
    }

    clearSearches() {
        const temp = {};
        for (var i = 0; i < this.state.numForms; i++) {
            temp[i] = {
                item: '',
                maxPrice: '',
                minPrice: '',
            }
        }
        $.ajax({
            method: 'DELETE',
            url: '/remove'
        });
        this.setState(temp);
    }

    handleChange(id, type, e) {
        let temp = this.state[id];
        temp[type] = e.target.value;
        this.setState({ [id]: temp });
    }

    render() {
        const forms = [];
        for (var i = 0; i < this.state.numForms; i++) {
            forms.push(
                <Form
                    formId={i}
                    value={this.state[i]}
                    getData={this.getData.bind(this)}
                    handleChange={this.handleChange.bind(this)}
                    setTextAlert={this.setTextAlert.bind(this)}
                />);
        }
        const listings = [];
        if (this.state[this.state.viewPage].results) {
            for (var i = 0; i < this.state[this.state.viewPage].results.length; i++) {
                listings.push(
                    <Listing
                        img={this.state[this.state.viewPage].results[i].img}
                        title={this.state[this.state.viewPage].results[i].title}
                        price={this.state[this.state.viewPage].results[i].price}
                        area={this.state[this.state.viewPage].results[i].area}
                        link={this.state[this.state.viewPage].results[i].link}
                    />
                )
            }
        }
        return (
            <div>
                <h1 className='title'>Craigs' Wish List</h1>
                <div className='forms'>
                    {forms}
                    <div className='buttons'>
                        <button onClick={this.addForm.bind(this)}>Moar</button>
                        <button onClick={this.clearSearches.bind(this)}>Clear Searches</button>
                    </div>
                </div>
                <div className='results'>
                    {listings}
                </div>
            </div>
        )
    }
}

class Form extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <form onSubmit={this.props.getData.bind(null, this.props.formId)}>
                <input type='text' value={this.props.value.item} placeholder='Search an item...' onChange={this.props.handleChange.bind(null, this.props.formId, 'item')}></input>
                <input type='text' value={this.props.value.maxPrice} placeholder='Max price' onChange={this.props.handleChange.bind(null, this.props.formId, 'maxPrice')}></input>
                <input type='text' value={this.props.value.minPrice} placeholder='Min Price' onChange={this.props.handleChange.bind(null, this.props.formId, 'minPrice')}></input>
                <input type='submit'></input>
                <button onClick={this.props.setTextAlert.bind(null, this.props.formId)}>Text Me</button>
            </form>
        )
    }
}

class Listing extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className='listing'>
                <a href={this.props.link}>
                    <img src={this.props.img} ></img>
                </a>
                <h1>{this.props.title}</h1>
                <p>{this.props.price}<span>{this.props.area}</span></p>
            </div>
        )
    }
}