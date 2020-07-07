import React from 'react';
import dayjs from 'dayjs';

class Contact extends React.Component {


	render() {
		return (
			<article className="contact" data-testid="contact">
				<span data-testid="contact-avatar" className="contact__avatar">
					<img src={this.props.avatar} alt={this.props.name} />
				</span>
				<span data-testid="contact-name" className="contact__data">
					{this.props.name}
				</span>
				<span data-testid="contact-phone" className="contact__data">
					{this.props.phone}
				</span>
				<span data-testid="contact-country" className="contact__data">
					{this.props.country}
				</span>
				<span data-testid="contact-date" className="contact__data">
        { dayjs(this.props.admissionDate).format('DD/MM/YYYY') }
				</span>
				<span data-testid="contact-company" className="contact__data">
					{this.props.company}
				</span>
				<span data-testid="contact-department" className="contact__data">
					{this.props.department}
				</span>
			</article>

		);
	}
}

export default Contact;
