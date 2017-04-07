import React from 'react';

export default 
class Listing extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className='listing'>
                <img src={this.props.img} ></img>
                <h1 value={this.props.title}></h1>
                <p value={this.props.price}><span value={this.props.area}></span></p>
            </div>
        )
    }
}