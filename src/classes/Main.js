import './Main.css';
import React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Divider, InputAdornment, ListItemIcon, ListItemText, Paper } from '@material-ui/core';
import { ErrorOutline, Refresh, CheckCircle, CallMade, CallReceived } from '@material-ui/icons';
import { green, red } from '@material-ui/core/colors';

class Main extends React.Component {
    constructor() {
        super();
        this.state = {
            url: "localhost:8083/ws",
            message: "",
            connection: 'disconnected',
            history: [],
            error: false,
            socket: null
        }
        this.setUrl = this.setUrl.bind(this)
        this.setMessage = this.setMessage.bind(this)
        this._handleConnect = this._handleConnect.bind(this)
        this._handleSendMessage = this._handleSendMessage.bind(this)
        this._checkStatus = this._checkStatus.bind(this)
    }

    setUrl(event) {
        this.setState({url: event.target.value})
    }

    setMessage(event) {
        this.setState({message: event.target.value})
    }

    _handleConnect() {
        if (this.state.connection === 'connected') {
            this.state.socket.close()
            this.setState({connection: 'disconnected'})
        }
        else {
            this.setState({connection: 'connecting', error: false})
            var socket = new WebSocket("ws://" + this.state.url)
            socket.onopen = (event) => {
                this.setState({connection: 'connected', error: false})
            }
            socket.onerror = (event) => {
                this.setState({error: true})
            }
            socket.onmessage = (event) => {
                var history = this.state.history
                history.push({direction: 'inbound', message: event.data, timestamp: Date()})
                this.setState({history: history})
            }
            this.setState({socket: socket})
        }
    }

    _handleSendMessage() {
        if (this.state.socket && this.state.socket.readyState === WebSocket.OPEN) {
            this.state.socket.send(this.state.message)
            var history = this.state.history
            history.push({direction: 'outboud', message: this.state.message, timestamp: Date()})
            this.setState({history: history})
        }
    }

    _checkStatus() {
        if (this.state.error) return <ErrorOutline style={{color: red['A700']}}/>
        if (this.state.connection === 'connecting' && !this.state.error) return <Refresh id="in-progress"/>
        if (this.state.connection === 'connected' && !this.state.error) return <CheckCircle style={{color: green['A700']}} />
    }

    _getConnectButton() {
        if (this.state.connection !== 'connected') {
            return(
                <Button variant="contained" color="primary" onClick={this._handleConnect}>Connect</Button>
            )
        }
        else {
            return(
                <Button variant="contained" color="secondary" onClick={this._handleConnect}>Disconnect</Button>
            )
        }

    }

    _renderListItem(item) {
        if(item.direction == 'outboud'){
            return (
                <ListItem button>
                    <ListItemIcon>
                        <CallMade style={{color: green['A400']}}/>
                    </ListItemIcon>
                    <ListItemText
                        primary={item.message}
                        secondary={item.timestamp.toLocaleString()}
                    />
                </ListItem>
            )
        }
        else {
            return (
                <ListItem button>
                    <ListItemIcon>
                        <CallReceived style={{color: red['A400']}}/>
                    </ListItemIcon>
                    <ListItemText
                        primary={item.message}
                        secondary={item.timestamp.toLocaleString()}
                    />
                </ListItem>
            )
        }
    }

    render() {
        return (
            <div className="App" style={{margin: 10, display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    {this._checkStatus()}
                    <FormControl variant="outlined" style={{flexGrow: 1, paddingRight: 10, paddingLeft: 10}}>
                    <TextField
                        id="websocket"
                        value={this.state.url}
                        label="WebSocket URL"
                        variant="outlined"
                        onChange={this.setUrl}
                        InputProps={{startAdornment: <InputAdornment position="start">ws://</InputAdornment>, spellCheck: 'false'}}
                    />
                    </FormControl>
                    {this._getConnectButton()}
                </div>
                <Divider style={{margin: 10}}/>
                <div style={{display: 'flex', paddingBottom: 10}}>
                    <FormControl style={{flexGrow: 1}}>
                        <TextField
                            disabled={this.state.connection != 'connected'}
                            id="message"
                            label="Message"
                            helperText="i.e. new-messages/subscribe"
                            value={this.state.message}
                            onChange={this.setMessage}
                            InputProps={{spellCheck: 'false'}}
                        />
                    </FormControl>
                    <Button
                        disabled={this.state.connection != 'connected'}
                        onClick={this._handleSendMessage}
                    >Send to Socket</Button>
                </div>
                <div>
                        <List style={{maxHeight: 400, overflow: 'auto'}}>
                            {this.state.history.slice(0).reverse().map((item) =>
                                this._renderListItem(item)
                            )}
                        </List>
                </div>
            </div>
        );
    }
}

export default Main;