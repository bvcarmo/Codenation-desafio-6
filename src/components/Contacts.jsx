import React from "react";
import Contact from "./Contact";
import PubSub from 'pubsub-js';

class Contacts extends React.Component {

	constructor(props){
		super(props)

		
		this.state = {
			contacts: [],
			allContacts : []
		}

		this.getContacts.bind(this)
		this.getContacts()

	}

	getContacts(){
		fetch('https://5e82ac6c78337f00160ae496.mockapi.io/api/v1/contacts')
		.then(response => response.json())
		  .then(data => 
			this.setState({contacts : data, allContacts: data}))
	}

	//compare
	  

	render() {
		return (
			<div className="container" data-testid="contacts">
				<section className="contacts">
					<article className="contact">
					<span className="contact__avatar" />
					<span className="contact__data">Nome</span>
					<span className="contact__data">Telefone</span>
					<span className="contact__data">País</span>
					<span className="contact__data">Admissão</span>
					<span className="contact__data">Empresa</span>
					<span className="contact__data">Departamento</span>
					</article>
					{
						this.state.contacts.map((contact) => {
							return(
								<Contact key={contact.id} name={contact.name} phone={contact.phone} avatar={contact.avatar}
									country={contact.country} date={contact.admissionDate} company={contact.company} department={contact.department}
								/>
								)
						})
					}
				</section>
			</div>
		);
	}

	componentDidMount(){


		PubSub.subscribe('atualiza-lista-usuarios',function(topico,textSearch){
			let newContacts = []
			this.state.allContacts.map((contato) => {
				if((contato.name.toUpperCase()).indexOf(textSearch.toUpperCase()) != -1){
					newContacts.push(contato)
				}
			})

			this.setState({contacts : newContacts})
			
		}.bind(this));
		
		PubSub.subscribe('ordenar',function(topico,idCampo){

			let campo = idCampo.replace("btnSort","")

			campo = campo[0].toLowerCase() + campo.substring(1,campo.lenght);
			
			let listaAtual = this.state.contacts

			listaAtual.sort(( a, b ) => {
				if ( a[campo] < b[campo] ){
				  return -1;
				}
				if ( a[campo] > b[campo] ){
				  return 1;
				}
				return 0;
			  });
			
			this.setState({
				contacts: listaAtual
			})

		}.bind(this));
	}
}

export default Contacts;
