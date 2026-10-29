import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type {
  ContactFormValues,
  SponsorshipInterest,
  SponsorshipSelection,
} from '../../types/congress';
import { sponsorshipLevels } from '../../data/perspectives';
import { supabase } from '../../lib/supabaseClient';
import styles from './ContactForm.module.css';

interface ContactFormProps {
  selection: SponsorshipSelection;
  onSelectionChange: (selection: SponsorshipSelection) => void;
}

type SubmissionStatus =
  | { kind: 'idle' }
  | { kind: 'invalid'; message: string }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string };

type ToastMessage = {
  kind: 'info' | 'success';
  message: string;
};

const initialValues: ContactFormValues = {
  name: '',
  role: '',
  company: '',
  organization: 'Hospital',
  email: '',
  message: '',
};

const interests: { id: Exclude<SponsorshipInterest, ''>; label: string }[] = [
  { id: 'asistencia', label: 'Solo asistencia' },
  { id: 'patrocinar', label: 'Patrocinar' },
];

export function ContactForm({ selection, onSelectionChange }: ContactFormProps) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<SubmissionStatus>({ kind: 'idle' });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.currentTarget;
    setValues((previous) => ({ ...previous, [name]: value }));
    setStatus({ kind: 'idle' });
  };

  const updateInterest = (interest: Exclude<SponsorshipInterest, ''>) => {
    onSelectionChange({
      interest,
      level: interest === 'patrocinar' ? selection.level : '',
    });
    setStatus({ kind: 'idle' });
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hasValidEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim());

    if (!values.name.trim() || !values.company.trim() || !hasValidEmail) {
      setStatus({ kind: 'invalid', message: 'Completa nombre, empresa y un correo válido.' });
      return;
    }

    const interest =
      selection.interest === 'patrocinar'
        ? `Patrocinar${selection.level ? ` · ${selection.level}` : ''}`
        : selection.interest === 'asistencia'
          ? 'Solo asistencia'
          : 'Sin especificar';
    const body = [
      `Nombre: ${values.name}`,
      `Cargo: ${values.role}`,
      `Empresa: ${values.company}`,
      `Tipo de organización: ${values.organization}`,
      `Correo: ${values.email}`,
      `Interés: ${interest}`,
      `Mensaje: ${values.message}`,
    ].join('\n');
    const client = supabase;
    if (client) {
      setStatus({ kind: 'submitting' });
      const { error } = await client.from('contact_messages').insert({
        full_name: values.name.trim(),
        role: values.role.trim() || null,
        company: values.company.trim(),
        organization: values.organization,
        email: values.email.trim(),
        interest: selection.interest || null,
        message: body,
      });
      if (error) {
        setStatus({ kind: 'error', message: 'No pudimos enviar tu mensaje. Intenta de nuevo.' });
      } else {
        setStatus({ kind: 'idle' });
        setValues(initialValues);
        setToast({
          kind: 'success',
          message: 'La información se envió correctamente. Nuestro equipo te contactará pronto.',
        });
      }
      return;
    }

    const subject = encodeURIComponent(`Patrocinio 3er Congreso · ${values.company}`);
    setToast({
      kind: 'info',
      message: 'Se abrirá tu aplicación de correo para que completes el envío de la información.',
    });
    window.location.href =
      `mailto:congreso@weecompany.net?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  const selectedStyles = (selected: boolean) => ({
    borderColor: selected ? 'var(--cn-color-lime)' : 'rgba(255,255,255,0.3)',
    backgroundColor: selected ? 'var(--cn-color-lime)' : 'transparent',
    color: selected ? 'var(--cn-color-deep)' : 'var(--cn-color-white)',
  });

  return (
    <section id="patrocinio" aria-labelledby="patrocinio-title" className={`${styles.scope} cn-style-beee21f0`}>
      <div className="cn-style-38a72450">
        <div className="cn-style-713b1cb4">
          <div className="cn-style-77f00dc1">Patrocinio 2027</div>
          <h2 id="patrocinio-title" className="cn-style-127923d7">
            Pon tu marca frente a todo el sector.
          </h2>
          <p className="cn-style-362dd83d">
            Déjanos tus datos y nuestro equipo te contactará con la propuesta de patrocinio
            para la 3ª edición.
          </p>
        </div>
        <form className="cn-style-4064b193" onSubmit={submitForm} noValidate>
          <div className="cn-style-ef0b2fe3">
            <Field label="Nombre completo *" id="p-nombre">
              <input
                id="p-nombre"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Nombre y apellido"
                value={values.name}
                onChange={updateField}
                aria-invalid={status.kind === 'invalid' && !values.name.trim()}
                aria-describedby={status.kind === 'invalid' ? 'contact-error' : undefined}
                className="cn-style-c0d3118d"
              />
            </Field>
            <Field label="Cargo" id="p-cargo">
              <input
                id="p-cargo"
                name="role"
                type="text"
                autoComplete="organization-title"
                placeholder="Director comercial"
                value={values.role}
                onChange={updateField}
                className="cn-style-c0d3118d"
              />
            </Field>
          </div>
          <div className="cn-style-ef0b2fe3">
            <Field label="Empresa *" id="p-empresa">
              <input
                id="p-empresa"
                name="company"
                type="text"
                autoComplete="organization"
                required
                placeholder="Nombre de la empresa"
                value={values.company}
                onChange={updateField}
                aria-invalid={status.kind === 'invalid' && !values.company.trim()}
                aria-describedby={status.kind === 'invalid' ? 'contact-error' : undefined}
                className="cn-style-c0d3118d"
              />
            </Field>
            <Field label="Tipo de organización" id="p-tipo">
              <select
                id="p-tipo"
                name="organization"
                value={values.organization}
                onChange={updateField}
                className="cn-style-c0d3118d"
              >
                <option>Hospital</option>
                <option>Aseguradora</option>
                <option>Proveedor de salud</option>
                <option>Laboratorio o farmacéutica</option>
                <option>Otro</option>
              </select>
            </Field>
          </div>
          <div className="cn-style-ef0b2fe3">
            <Field label="Correo electrónico *" id="p-correo">
              <input
                id="p-correo"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nombre@empresa.com"
                value={values.email}
                onChange={updateField}
                aria-invalid={status.kind === 'invalid' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())}
                aria-describedby={status.kind === 'invalid' ? 'contact-error' : undefined}
                className="cn-style-c0d3118d"
              />
            </Field>
          </div>
          <fieldset className="cn-style-622902c9">
            <legend className="cn-style-5fb806a0">Nivel de interés</legend>
            <div className="cn-style-b4534c93">
              {interests.map((interest) => {
                const selected = selection.interest === interest.id;
                return (
                  <button
                    key={interest.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateInterest(interest.id)}
                    style={selectedStyles(selected)}
                    className="cn-style-28bbeefe"
                  >
                    {interest.label}
                  </button>
                );
              })}
            </div>
            {selection.interest === 'patrocinar' && (
              <div className="cn-style-b747d61c">
                <span className="cn-style-640108bf">¿Cómo te gustaría participar?</span>
                <div className="cn-style-b4534c93">
                  {sponsorshipLevels.map((level) => {
                    const selected = selection.level === level.id;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          onSelectionChange({ interest: 'patrocinar', level: level.id })
                        }
                        style={selectedStyles(selected)}
                        className="cn-style-847a2ec3"
                      >
                        {level.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </fieldset>
          <Field label="Mensaje (opcional)" id="p-msg">
            <textarea
              id="p-msg"
              name="message"
              rows={3}
              placeholder="Cuéntanos qué te interesa"
              value={values.message}
              onChange={updateField}
              className="cn-style-e5e039a6"
            />
          </Field>
          {(status.kind === 'invalid' || status.kind === 'error') && (
            <p id="contact-error" role="alert" className="cn-style-b10d7528">
              {status.message}
            </p>
          )}
          <button type="submit" disabled={status.kind === 'submitting'} className="cn-style-57ef7b41">
            {status.kind === 'submitting' ? 'Enviando...' : 'Enviar'}
          </button>
          <p className="cn-style-b5ef31ec">* Campos obligatorios.</p>
        </form>
      </div>
      {toast && (
        <p
          className={`${styles.toast} ${toast.kind === 'success' ? styles.toastSuccess : styles.toastInfo}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {toast.message}
        </p>
      )}
    </section>
  );
}

interface FieldProps {
  children: React.ReactNode;
  id: string;
  label: string;
}

function Field({ children, id, label }: FieldProps) {
  return (
    <div className="cn-style-da69abe7">
      <label htmlFor={id} className="cn-style-afa7d5d3">{label}</label>
      {children}
    </div>
  );
}
