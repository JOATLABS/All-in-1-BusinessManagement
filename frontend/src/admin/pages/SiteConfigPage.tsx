import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { FooterNavLink, OverlayView, RawSiteContent, SiteContent } from '../../types/content';

interface AdminOutletContext {
  siteContent: SiteContent;
}

type SaveState = 'idle' | 'saving' | 'saved';

const cloneContent = (content: SiteContent): RawSiteContent => ({
  hero: {
    ...content.hero,
    words: [...content.hero.words],
    navLinks: content.hero.navLinks.map((link) => ({ ...link })),
    ctas: content.hero.ctas.map((cta) => ({ ...cta })),
    backgrounds: content.hero.backgrounds.map((background) => ({ ...background }))
  },
  event: {
    ...content.event,
    start: content.event.start.toISOString(),
    end: content.event.end.toISOString(),
    headliners: [...content.event.headliners]
  },
  panels: {
    event: { ...content.panels.event },
    reserve: {
      ...content.panels.reserve,
      description: [...content.panels.reserve.description],
      highlights: [...content.panels.reserve.highlights]
    },
    tickets: { ...content.panels.tickets },
    contact: {
      ...content.panels.contact,
      options: content.panels.contact.options.map((option) => ({ ...option }))
    },
    about: {
      ...content.panels.about,
      paragraphs: [...content.panels.about.paragraphs],
      hours: content.panels.about.hours.map((row) => ({ ...row }))
    },
    legal: {
      ...content.panels.legal,
      tabs: content.panels.legal.tabs.map((tab) => ({ ...tab, paragraphs: [...tab.paragraphs] }))
    }
  },
  footer: {
    socials: content.footer.socials.map((social) => ({ ...social })),
    links: content.footer.links.map((link) => ({ label: link.label, action: { ...link.action } }))
  }
});

const toDateTimeLocalValue = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.toISOString().slice(0, 16)}`;
};

const tabs = [
  { id: 'hero', label: 'Landing Hero' },
  { id: 'event', label: 'Upcoming Event' },
  { id: 'reserve', label: 'Reserve Modal' },
  { id: 'tickets', label: 'Tickets Modal' },
  { id: 'contact', label: 'Contact Modal' },
  { id: 'about', label: 'About Modal' },
  { id: 'legal', label: 'Legal Modal' },
  { id: 'footer', label: 'Footer' }
];

export const SiteConfigPage = () => {
  const { siteContent } = useOutletContext<AdminOutletContext>();
  const [formState, setFormState] = useState<RawSiteContent>(() => cloneContent(siteContent));
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  const backgroundPreviews = useMemo(() => formState.hero.backgrounds.map((background) => background.src), [formState.hero.backgrounds]);

  const handleSave = async (event: FormEvent<HTMLFormElement>, section: string) => {
    event.preventDefault();
    setSaveStates((prev) => ({ ...prev, [section]: 'saving' }));
    await new Promise((resolve) => setTimeout(resolve, 650));
    setSaveStates((prev) => ({ ...prev, [section]: 'saved' }));
  };

  const createSubmitHandler = (section: string) => (event: FormEvent<HTMLFormElement>) => {
    void handleSave(event, section);
  };

  const renderSaveButton = (section: string) => {
    const state = saveStates[section] ?? 'idle';
    if (state === 'saving') {
      return (
        <button type="submit" className="admin-form__save" disabled>
          Saving…
        </button>
      );
    }
    if (state === 'saved') {
      return (
        <button type="submit" className="admin-form__save admin-form__save--success">
          Saved
        </button>
      );
    }
    return (
      <button type="submit" className="admin-form__save">
        Save changes
      </button>
    );
  };

  return (
    <div className="admin-config">
      <div className="admin-config__sidebar" role="tablist" aria-label="Site configuration sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-config__tab${tab.id === activeTab ? ' admin-config__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={tab.id === activeTab}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="admin-config__content" role="tabpanel">
        {activeTab === 'hero' && (
          <form className="admin-form" onSubmit={createSubmitHandler('hero')}>
            <fieldset>
              <legend>Hero Identity</legend>
              <label>
                <span>Club name</span>
                <input
                  value={formState.hero.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, hero: { ...prev.hero, name: event.target.value } }))
                  }
                />
              </label>
              <label>
                <span>Tagline</span>
                <input
                  value={formState.hero.tagline}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, hero: { ...prev.hero, tagline: event.target.value } }))
                  }
                />
              </label>
              <label>
                <span>Countdown label</span>
                <input
                  value={formState.hero.countdownLabel}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, hero: { ...prev.hero, countdownLabel: event.target.value } }))
                  }
                />
              </label>
              <div className="admin-form__grid">
                <label>
                  <span>Flyer eyebrow</span>
                  <input
                    value={formState.hero.flyerEyebrow}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, hero: { ...prev.hero, flyerEyebrow: event.target.value } }))
                    }
                  />
                </label>
                <label>
                  <span>Flyer close label</span>
                  <input
                    value={formState.hero.flyerCloseLabel}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, hero: { ...prev.hero, flyerCloseLabel: event.target.value } }))
                    }
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Marquee words</legend>
              {formState.hero.words.map((word, index) => (
                <label key={`word-${index}`}>
                  <span>Word {index + 1}</span>
                  <input
                    value={word}
                    onChange={(event) =>
                      setFormState((prev) => {
                        const words = [...prev.hero.words];
                        words[index] = event.target.value;
                        return { ...prev, hero: { ...prev.hero, words } };
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>Navigation & CTAs</legend>
              <div className="admin-form__grid">
                {formState.hero.navLinks.map((link, index) => (
                  <label key={`nav-${link.id}`}>
                    <span>{link.id} label</span>
                    <input
                      value={link.label}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const navLinks = prev.hero.navLinks.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          );
                          return { ...prev, hero: { ...prev.hero, navLinks } };
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="admin-form__grid">
                {formState.hero.ctas.map((cta, index) => (
                  <label key={`cta-${cta.id}`}>
                    <span>{cta.id} button</span>
                    <input
                      value={cta.label}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const ctas = prev.hero.ctas.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          );
                          return { ...prev, hero: { ...prev.hero, ctas } };
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Background rotation</legend>
              {formState.hero.backgrounds.map((background, index) => (
                <div key={`background-${index}`} className="admin-form__background">
                  <label>
                    <span>Image URL</span>
                    <input
                      value={background.src}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const backgrounds = prev.hero.backgrounds.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, src: event.target.value } : item
                          );
                          return { ...prev, hero: { ...prev.hero, backgrounds } };
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Alt text</span>
                    <input
                      value={background.alt}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const backgrounds = prev.hero.backgrounds.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, alt: event.target.value } : item
                          );
                          return { ...prev, hero: { ...prev.hero, backgrounds } };
                        })
                      }
                    />
                  </label>
                  <div className="admin-form__preview" aria-hidden="true" style={{ backgroundImage: `url(${backgroundPreviews[index]})` }} />
                </div>
              ))}
            </fieldset>

            {renderSaveButton('hero')}
          </form>
        )}

        {activeTab === 'event' && (
          <form className="admin-form" onSubmit={createSubmitHandler('event')}>
            <fieldset>
              <legend>Event Details</legend>
              <label>
                <span>Experience name</span>
                <input
                  value={formState.event.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, event: { ...prev.event, name: event.target.value } }))}
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  value={formState.event.description}
                  rows={4}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, event: { ...prev.event, description: event.target.value } }))
                  }
                />
              </label>
              <div className="admin-form__grid">
                <label>
                  <span>Doors open</span>
                  <input
                    type="datetime-local"
                    value={toDateTimeLocalValue(formState.event.start)}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, event: { ...prev.event, start: new Date(event.target.value).toISOString() } }))
                    }
                  />
                </label>
                <label>
                  <span>Doors close</span>
                  <input
                    type="datetime-local"
                    value={toDateTimeLocalValue(formState.event.end)}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, event: { ...prev.event, end: new Date(event.target.value).toISOString() } }))
                    }
                  />
                </label>
              </div>
              <div className="admin-form__grid">
                <label>
                  <span>Flyer URL</span>
                  <input
                    value={formState.event.flyer}
                    onChange={(event) => setFormState((prev) => ({ ...prev, event: { ...prev.event, flyer: event.target.value } }))}
                  />
                </label>
                <label>
                  <span>Calendar URL</span>
                  <input
                    value={formState.event.calendarUrl ?? ''}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, event: { ...prev.event, calendarUrl: event.target.value } }))
                    }
                  />
                </label>
              </div>
              <label>
                <span>Ticket URL</span>
                <input
                  value={formState.event.ticketUrl ?? ''}
                  onChange={(event) => setFormState((prev) => ({ ...prev, event: { ...prev.event, ticketUrl: event.target.value } }))}
                />
              </label>
              <label>
                <span>Concierge hotline</span>
                <input
                  value={formState.event.tableHotline}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, event: { ...prev.event, tableHotline: event.target.value } }))
                  }
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>Talent lineup</legend>
              {formState.event.headliners.map((headliner, index) => (
                <label key={`headliner-${index}`}>
                  <span>Performer {index + 1}</span>
                  <input
                    value={headliner}
                    onChange={(event) =>
                      setFormState((prev) => {
                        const headliners = [...prev.event.headliners];
                        headliners[index] = event.target.value;
                        return { ...prev, event: { ...prev.event, headliners } };
                      })
                    }
                  />
                </label>
              ))}
              <label className="admin-form__checkbox">
                <input
                  type="checkbox"
                  checked={formState.event.requiresTicket}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, event: { ...prev.event, requiresTicket: event.target.checked } }))
                  }
                />
                <span>Pre-sale ticket required</span>
              </label>
            </fieldset>

            {renderSaveButton('event')}
          </form>
        )}

        {activeTab === 'reserve' && (
          <form className="admin-form" onSubmit={createSubmitHandler('reserve')}>
            <fieldset>
              <legend>Reserve copy</legend>
              <label>
                <span>Eyebrow</span>
                <input
                  value={formState.panels.reserve.eyebrow}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, reserve: { ...prev.panels.reserve, eyebrow: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Title</span>
                <input
                  value={formState.panels.reserve.title}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, reserve: { ...prev.panels.reserve, title: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Subtitle</span>
                <input
                  value={formState.panels.reserve.subtitle}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, reserve: { ...prev.panels.reserve, subtitle: event.target.value } }
                    }))
                  }
                />
              </label>
              {formState.panels.reserve.description.map((paragraph, index) => (
                <label key={`reserve-desc-${index}`}>
                  <span>Description {index + 1}</span>
                  <textarea
                    rows={3}
                    value={paragraph}
                    onChange={(event) =>
                      setFormState((prev) => {
                        const description = [...prev.panels.reserve.description];
                        description[index] = event.target.value;
                        return {
                          ...prev,
                          panels: { ...prev.panels, reserve: { ...prev.panels.reserve, description } }
                        };
                      })
                    }
                  />
                </label>
              ))}
              {formState.panels.reserve.highlights.map((highlight, index) => (
                <label key={`reserve-highlight-${index}`}>
                  <span>Highlight {index + 1}</span>
                  <input
                    value={highlight}
                    onChange={(event) =>
                      setFormState((prev) => {
                        const highlights = [...prev.panels.reserve.highlights];
                        highlights[index] = event.target.value;
                        return {
                          ...prev,
                          panels: { ...prev.panels, reserve: { ...prev.panels.reserve, highlights } }
                        };
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Contact actions</legend>
              <div className="admin-form__grid">
                <label>
                  <span>Email CTA label</span>
                  <input
                    value={formState.panels.reserve.emailCtaLabel}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        panels: { ...prev.panels, reserve: { ...prev.panels.reserve, emailCtaLabel: event.target.value } }
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Email address</span>
                  <input
                    value={formState.panels.reserve.emailAddress}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        panels: { ...prev.panels, reserve: { ...prev.panels.reserve, emailAddress: event.target.value } }
                      }))
                    }
                  />
                </label>
              </div>
              <label>
                <span>Email subject</span>
                <input
                  value={formState.panels.reserve.emailSubject}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, reserve: { ...prev.panels.reserve, emailSubject: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Hotline CTA label</span>
                <input
                  value={formState.panels.reserve.hotlineCtaLabel}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, reserve: { ...prev.panels.reserve, hotlineCtaLabel: event.target.value } }
                    }))
                  }
                />
              </label>
            </fieldset>
            {renderSaveButton('reserve')}
          </form>
        )}

        {activeTab === 'tickets' && (
          <form className="admin-form" onSubmit={createSubmitHandler('tickets')}>
            <fieldset>
              <legend>Ticket messaging</legend>
              <label>
                <span>Eyebrow</span>
                <input
                  value={formState.panels.tickets.eyebrow}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, tickets: { ...prev.panels.tickets, eyebrow: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Title</span>
                <input
                  value={formState.panels.tickets.title}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, tickets: { ...prev.panels.tickets, title: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Subtitle</span>
                <input
                  value={formState.panels.tickets.subtitle}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, tickets: { ...prev.panels.tickets, subtitle: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Required copy</span>
                <textarea
                  rows={3}
                  value={formState.panels.tickets.requiredCopy}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, tickets: { ...prev.panels.tickets, requiredCopy: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Complimentary copy</span>
                <textarea
                  rows={3}
                  value={formState.panels.tickets.complimentaryCopy}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, tickets: { ...prev.panels.tickets, complimentaryCopy: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>CTA label</span>
                <input
                  value={formState.panels.tickets.ctaLabel}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, tickets: { ...prev.panels.tickets, ctaLabel: event.target.value } }
                    }))
                  }
                />
              </label>
            </fieldset>
            {renderSaveButton('tickets')}
          </form>
        )}

        {activeTab === 'contact' && (
          <form className="admin-form" onSubmit={createSubmitHandler('contact')}>
            <fieldset>
              <legend>Contact form copy</legend>
              <label>
                <span>Eyebrow</span>
                <input
                  value={formState.panels.contact.eyebrow}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, contact: { ...prev.panels.contact, eyebrow: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Title</span>
                <input
                  value={formState.panels.contact.title}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, contact: { ...prev.panels.contact, title: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Subtitle</span>
                <input
                  value={formState.panels.contact.subtitle}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, contact: { ...prev.panels.contact, subtitle: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Success message</span>
                <textarea
                  rows={2}
                  value={formState.panels.contact.successMessage}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, contact: { ...prev.panels.contact, successMessage: event.target.value } }
                    }))
                  }
                />
              </label>
            </fieldset>
            <fieldset>
              <legend>Form fields</legend>
              <div className="admin-form__grid">
                <label>
                  <span>Name label</span>
                  <input
                    value={formState.panels.contact.nameLabel}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        panels: { ...prev.panels, contact: { ...prev.panels.contact, nameLabel: event.target.value } }
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Name placeholder</span>
                  <input
                    value={formState.panels.contact.namePlaceholder}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        panels: { ...prev.panels, contact: { ...prev.panels.contact, namePlaceholder: event.target.value } }
                      }))
                    }
                  />
                </label>
              </div>
              <div className="admin-form__grid">
                <label>
                  <span>Email label</span>
                  <input
                    value={formState.panels.contact.emailLabel}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        panels: { ...prev.panels, contact: { ...prev.panels.contact, emailLabel: event.target.value } }
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Email placeholder</span>
                  <input
                    value={formState.panels.contact.emailPlaceholder}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        panels: { ...prev.panels, contact: { ...prev.panels.contact, emailPlaceholder: event.target.value } }
                      }))
                    }
                  />
                </label>
              </div>
              <div className="admin-form__grid">
                <label>
                  <span>Company label</span>
                  <input
                    value={formState.panels.contact.companyLabel}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        panels: { ...prev.panels, contact: { ...prev.panels.contact, companyLabel: event.target.value } }
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Company placeholder</span>
                  <input
                    value={formState.panels.contact.companyPlaceholder}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        panels: { ...prev.panels, contact: { ...prev.panels.contact, companyPlaceholder: event.target.value } }
                      }))
                    }
                  />
                </label>
              </div>
              <label>
                <span>Enquiry label</span>
                <input
                  value={formState.panels.contact.enquiryLabel}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, contact: { ...prev.panels.contact, enquiryLabel: event.target.value } }
                    }))
                  }
                />
              </label>
              {formState.panels.contact.options.map((option, index) => (
                <div key={`contact-option-${index}`} className="admin-form__grid">
                  <label>
                    <span>Option label</span>
                    <input
                      value={option.label}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const options = prev.panels.contact.options.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          );
                          return { ...prev, panels: { ...prev.panels, contact: { ...prev.panels.contact, options } } };
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Option value</span>
                    <input
                      value={option.value}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const options = prev.panels.contact.options.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, value: event.target.value } : item
                          );
                          return { ...prev, panels: { ...prev.panels, contact: { ...prev.panels.contact, options } } };
                        })
                      }
                    />
                  </label>
                </div>
              ))}
              <label>
                <span>Project label</span>
                <input
                  value={formState.panels.contact.projectLabel}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, contact: { ...prev.panels.contact, projectLabel: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Project placeholder</span>
                <textarea
                  rows={3}
                  value={formState.panels.contact.projectPlaceholder}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, contact: { ...prev.panels.contact, projectPlaceholder: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Submit label</span>
                <input
                  value={formState.panels.contact.submitLabel}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, contact: { ...prev.panels.contact, submitLabel: event.target.value } }
                    }))
                  }
                />
              </label>
            </fieldset>
            {renderSaveButton('contact')}
          </form>
        )}

        {activeTab === 'about' && (
          <form className="admin-form" onSubmit={createSubmitHandler('about')}>
            <fieldset>
              <legend>About modal</legend>
              <label>
                <span>Eyebrow</span>
                <input
                  value={formState.panels.about.eyebrow}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, about: { ...prev.panels.about, eyebrow: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Title</span>
                <input
                  value={formState.panels.about.title}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, about: { ...prev.panels.about, title: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Subtitle</span>
                <input
                  value={formState.panels.about.subtitle}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, about: { ...prev.panels.about, subtitle: event.target.value } }
                    }))
                  }
                />
              </label>
              {formState.panels.about.paragraphs.map((paragraph, index) => (
                <label key={`about-paragraph-${index}`}>
                  <span>Paragraph {index + 1}</span>
                  <textarea
                    rows={3}
                    value={paragraph}
                    onChange={(event) =>
                      setFormState((prev) => {
                        const paragraphs = [...prev.panels.about.paragraphs];
                        paragraphs[index] = event.target.value;
                        return { ...prev, panels: { ...prev.panels, about: { ...prev.panels.about, paragraphs } } };
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Operating hours</legend>
              {formState.panels.about.hours.map((row, index) => (
                <div key={`hours-${index}`} className="admin-form__grid">
                  <label>
                    <span>Label</span>
                    <input
                      value={row.label}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const hours = prev.panels.about.hours.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          );
                          return { ...prev, panels: { ...prev.panels, about: { ...prev.panels.about, hours } } };
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Value</span>
                    <input
                      value={row.value}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const hours = prev.panels.about.hours.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, value: event.target.value } : item
                          );
                          return { ...prev, panels: { ...prev.panels, about: { ...prev.panels.about, hours } } };
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </fieldset>
            {renderSaveButton('about')}
          </form>
        )}

        {activeTab === 'legal' && (
          <form className="admin-form" onSubmit={createSubmitHandler('legal')}>
            <fieldset>
              <legend>Legal modal</legend>
              <label>
                <span>Eyebrow</span>
                <input
                  value={formState.panels.legal.eyebrow}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, legal: { ...prev.panels.legal, eyebrow: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Title</span>
                <input
                  value={formState.panels.legal.title}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, legal: { ...prev.panels.legal, title: event.target.value } }
                    }))
                  }
                />
              </label>
              <label>
                <span>Subtitle</span>
                <input
                  value={formState.panels.legal.subtitle}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      panels: { ...prev.panels, legal: { ...prev.panels.legal, subtitle: event.target.value } }
                    }))
                  }
                />
              </label>
            </fieldset>
            <fieldset>
              <legend>Tabs</legend>
              {formState.panels.legal.tabs.map((tab, index) => (
                <div key={`legal-tab-${index}`} className="admin-form__tab">
                  <div className="admin-form__grid">
                    <label>
                      <span>Tab label</span>
                      <input
                        value={tab.label}
                        onChange={(event) =>
                          setFormState((prev) => {
                            const tabsState = prev.panels.legal.tabs.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, label: event.target.value } : item
                            );
                            return { ...prev, panels: { ...prev.panels, legal: { ...prev.panels.legal, tabs: tabsState } } };
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Tab id</span>
                      <input
                        value={tab.id}
                        onChange={(event) =>
                          setFormState((prev) => {
                            const tabsState = prev.panels.legal.tabs.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, id: event.target.value } : item
                            );
                            return { ...prev, panels: { ...prev.panels, legal: { ...prev.panels.legal, tabs: tabsState } } };
                          })
                        }
                      />
                    </label>
                  </div>
                  {tab.paragraphs.map((paragraph, paragraphIndex) => (
                    <label key={`legal-paragraph-${index}-${paragraphIndex}`}>
                      <span>Paragraph {paragraphIndex + 1}</span>
                      <textarea
                        rows={3}
                        value={paragraph}
                        onChange={(event) =>
                          setFormState((prev) => {
                            const tabsState = prev.panels.legal.tabs.map((item, itemIndex) => {
                              if (itemIndex !== index) {
                                return item;
                              }
                              const paragraphs = [...item.paragraphs];
                              paragraphs[paragraphIndex] = event.target.value;
                              return { ...item, paragraphs };
                            });
                            return { ...prev, panels: { ...prev.panels, legal: { ...prev.panels.legal, tabs: tabsState } } };
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              ))}
            </fieldset>
            {renderSaveButton('legal')}
          </form>
        )}

        {activeTab === 'footer' && (
          <form className="admin-form" onSubmit={createSubmitHandler('footer')}>
            <fieldset>
              <legend>Footer navigation</legend>
              {formState.footer.links.map((link, index) => (
                <div key={`footer-link-${index}`} className="admin-form__grid">
                  <label>
                    <span>Label</span>
                    <input
                      value={link.label}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const links = prev.footer.links.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          );
                          return { ...prev, footer: { ...prev.footer, links } };
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Destination</span>
                    <input
                      value={link.action.target}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const links = prev.footer.links.map<FooterNavLink>((item, itemIndex) => {
                            if (itemIndex !== index) {
                              return item;
                            }
                            if (item.action.type === 'route') {
                              return { ...item, action: { type: 'route', target: event.target.value } };
                            }
                            return {
                              ...item,
                              action: {
                                type: 'overlay',
                                target: event.target.value as Extract<OverlayView, 'about' | 'legal'>
                              }
                            };
                          });
                          return { ...prev, footer: { ...prev.footer, links } };
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </fieldset>
            <fieldset>
              <legend>Socials</legend>
              {formState.footer.socials.map((social, index) => (
                <div key={`social-${index}`} className="admin-form__grid">
                  <label>
                    <span>Platform</span>
                    <input
                      value={social.name}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const socials = prev.footer.socials.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, name: event.target.value } : item
                          );
                          return { ...prev, footer: { ...prev.footer, socials } };
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>URL</span>
                    <input
                      value={social.url}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const socials = prev.footer.socials.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, url: event.target.value } : item
                          );
                          return { ...prev, footer: { ...prev.footer, socials } };
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Icon</span>
                    <input
                      value={social.icon ?? ''}
                      onChange={(event) =>
                        setFormState((prev) => {
                          const socials = prev.footer.socials.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, icon: event.target.value as typeof item.icon }
                              : item
                          );
                          return { ...prev, footer: { ...prev.footer, socials } };
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </fieldset>
            {renderSaveButton('footer')}
          </form>
        )}
      </div>
    </div>
  );
};

