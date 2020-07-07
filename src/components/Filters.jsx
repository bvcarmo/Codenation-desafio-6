import React from 'react';
import PubSub from 'pubsub-js';

class Filters extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			campoPesquisar: ''
		}

		this.ordenar = this.ordenar.bind(this)
		this.pesquisar = this.pesquisar.bind(this)
	}

	render() {
		return (
			<div className="container" data-testid="filters">
				<section className="filters">
					<div className="filters__search">
					<input type="text" className="filters__search__input" placeholder="Pesquisar" onChange={this.pesquisar} />

					<button className="filters__search__icon">
						<i className="fa fa-search"/>
					</button>
					</div>

					<button id="btnSortName" className="filters__item is-selected" onClick={this.ordenar}>
					Nome <i className="fas fa-sort-down" />
					</button>

					<button id="btnSortCountry" className="filters__item" onClick={this.ordenar}>
					País <i className="fas fa-sort-down" />
					</button>

					<button id="btnSortCompany" className="filters__item" onClick={this.ordenar}>
					Empresa <i className="fas fa-sort-down" />
					</button>

					<button id="btnSortDepartment" className="filters__item" onClick={this.ordenar}>
					Departamento <i className="fas fa-sort-down" />
					</button>

					<button id="btnSortAdmissionDate" className="filters__item" onClick={this.ordenar}>
					Data de admissão <i className="fas fa-sort-down" />
					</button>
				</section>
			</div>

		);
	}

	pesquisar(event){
		
		let valorCampo = event.target.value;
		this.setState({
			campoPesquisar: valorCampo
		})
		PubSub.publish('atualiza-lista-usuarios',valorCampo);

	}

	ordenar(event){

		let idCampo = event.target.id;
		PubSub.publish('ordenar',idCampo)
	}
}

export default Filters;
