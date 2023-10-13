window.addEventListener("DOMContentLoaded",() => {
	const c = new Clock2(".clock",true);
});

class Clock2 {
	now = null;
	then = null;

	constructor(el,is24Hours = false) {
		this.el = document.querySelector(el);
		this.is24Hours = is24Hours;

		this.init();
	}
	init() {
		this.timeUpdate();
	}
	get timeAsObject() {
		const date = new Date();
		let h = date.getHours();
		const m = date.getMinutes();
		const s = date.getSeconds();
		const ap = h > 11 ? "PM" : "AM";
		// milisegundos desde 1/1/1970
		const since1970 = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
		// tratar con medianoche y 13:00 si no se utiliza el reloj de 24 horas
		if (!this.is24Hours) {
			if (h === 0) h += 12;
			else if (h > 12) h -= 12;
		}
		return { h, m, s, ap, since1970 };
	}
	get timeAsString() {
		let { h, m, s, ap } = this.timeAsObject;
		// anteponer 0 al minuto y segundo si son de un solo dígito
		if (m < 10) m = `0${m}`;
		if (s < 10) s = `0${s}`;

		let timestamp = `${h}:${m}:${s}`;

		if (!this.is24Hours) timestamp += ` ${ap}`

		return timestamp;
	}
	timeUpdate() {
		// actualizar etiqueta `aria-label`
		this.el?.setAttribute("aria-label", this.timeAsString);
		// reset animación
		const rolling = "clock__unit--rolling";
		const unitEls = Array.from(this.el.querySelectorAll(`[data-unit]`));
		unitEls.forEach(el => {
			el.classList.remove(rolling);
		});
		void this.el.offsetWidth;
		// actualizar los objetos de tiempo
		this.then = this.now;
		this.now = this.timeAsObject;
		const { then, now } = this;

		Object.keys(now).forEach(unit => {
			const unitEl = this.el.querySelector(`[data-unit="${unit}"]`);
			if (!unitEl) return
			// añadir la animación rondante cuando los dígitos no sean iguales
			if (then !== null && then[unit] !== now[unit]) unitEl.classList.add(rolling);
			// actualizar los dígitos
			const unitPos = Array.from(unitEl.querySelectorAll(`[data-unit-pos]`));
			let posIndex = -3;
			unitPos.forEach(pos => {
				let digits = now[unit] + posIndex;
				const unitLoop = unit === "h" ? 24 : 60;

				if (digits < 0) digits += unitLoop;
				else if (digits >= unitLoop) digits -= unitLoop;

				let digitsString = `${digits}`;
				if (digits < 10) digitsString = `0${digits}`;

				pos.innerText = digitsString;
				++posIndex;
			});
		});
		// loop
		clearTimeout(this.timeUpdateLoop);
		this.timeUpdateLoop = setTimeout(this.timeUpdate.bind(this),1e3);
	}

	// Fecha
	updateDate() {
		const dateEl = document.querySelector('.date');
		const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		const today = new Date();
		const formattedDate = today.toLocaleDateString('es-ES', dateOptions);
	  
		const modifiedDate = formattedDate.replace(/(\s[a-z])/g, match => match.toUpperCase());
	  
		dateEl.textContent = modifiedDate;
	  }
	
	  init() {
		this.timeUpdate();
		this.updateDate(); // Inicializar la fecha.
	  }
}