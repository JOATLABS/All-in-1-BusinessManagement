import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { FooterLink, HeroBackground, SiteContent } from '../types/content';

type ConfigurationTab = 'hero' | 'event' | 'about' | 'contact' | 'footer';

interface ConfigurationDraft {
  hero: {
    name: string;
    tagline: string;
    words: string[];
    backgrounds: HeroBackground[];
  };
  nav: {
    about: string;
    events: string;
    reserve: string;
    contact: string;
    ctaEvent: string;
    ctaReserve: string;
    ctaTicket: string;
    ctaContact: string;
  };
  event: {
    name: string;
    start: string;
    end: string;
    flyer: string;
    description: string;
    headliners: string[];
    requiresTicket: boolean;
    ticketUrl: string;
    tableHotline: string;
    flyerEyebrow: string;
    closeLabel: string;
  };
  about: {
    title: string;
    subtitle: string;
    paragraphs: string[];
    hours: string[];
  };
  contact: {
    title: string;
    subtitle: string;
    categories: string[];
    confirmation: string;
  };
  footer: {
    operatingLabel: string;
    legalLabel: string;
    adminLabel: string;
    socials: FooterLink[];
  };
}

const formatDateInput = (value: Date) => value.toISOString().slice(0, 16);

interface SiteConfigurationProps {
  content: SiteContent;
}

export const SiteConfiguration = ({ content }: SiteConfigurationProps) => {
  const initialDraft = useMemo<ConfigurationDraft>(
    () => ({
      hero: {
        name: content.hero.name,
        tagline: content.hero.tagline,
        words: [...content.hero.words],
        backgrounds: content.hero.backgrounds.map((background) => ({ ...background })),
      },
      nav: {
        about: 'About',
        events: 'Events',
        reserve: 'Reserve',
        contact: 'Contact',
        ctaEvent: 'Upcoming Event',
        ctaReserve: 'Table Reservation',
        ctaTicket: 'Ticket Pre-Sale',
        ctaContact: 'Contact Us',
      },
      event: {
        name: content.event.name,
        start: formatDateInput(content.event.start),
        end: formatDateInput(content.event.end),
        flyer: content.event.flyer,
        description: content.event.description,
        headliners: [...content.event.headliners],
        requiresTicket: content.event.requiresTicket,
        ticketUrl: '',
        tableHotline: content.event.tableHotline,
        flyerEyebrow: 'Upcoming Experience',
        closeLabel: 'Close Flyer',
      },
      about: {
        title: 'Our Story',
        subtitle: 'Born in Lagos, elevated in Manhattan',
        paragraphs: [
          'OjaPlus Nightclub resurrects the avant-garde spirit of the island’s nightlife with six sensory suites, immersive motion graphics, and a culinary program that bridges West African heat with global finesse.',
          'Every room features handcrafted timber, velvet seating, and lighting sequences designed to echo vintage cinema reels. Expect curated Afrofuturist playlists, surprise performances, and midnight rituals that amplify the dance floor.',
        ],
        hours: ['Thursday–Saturday: 9:00 PM – 4:00 AM', 'Sunday: 5:00 PM – 11:00 PM (Experiential supper club)'],
      },
      contact: {
        title: 'Partner with us',
        subtitle: 'Choose your enquiry type and our concierge will respond within 30 minutes.',
        categories: ['Food & Drink', 'Private Hire', 'General Enquiry'],
        confirmation: 'Thanks for reaching out. Our partnership team will respond shortly.',
      },
      footer: {
        operatingLabel: 'Operating Hours',
        legalLabel: 'Legal',
        adminLabel: 'Admin',
        socials: content.footer.socials.map((link) => ({ ...link })),
      },
    }),
    [content]
  );

  const [activeTab, setActiveTab] = useState<ConfigurationTab>('hero');
  const [draft, setDraft] = useState<ConfigurationDraft>(initialDraft);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  const showNotice = (message: string) => {
    setSaveNotice(message);
    setTimeout(() => {
      setSaveNotice(null);
    }, 3200);
  };

  const handleHeroSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showNotice('Landing hero settings staged. Connect the API layer to publish updates.');
  };

  const handleEventSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showNotice('Event details saved locally. Wire up the /events endpoints to persist.');
  };

  const handleAboutSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showNotice('About modal copy ready. Push to the content service to finalise.');
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showNotice('Contact routing staged. Map to the enquiries API to complete.');
  };

  const handleFooterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showNotice('Footer configuration ready. Persist via the social-links endpoints.');
  };

  const updateBackground = (index: number, updates: Partial<HeroBackground>) => {
    setDraft((prev) => {
      const backgrounds = prev.hero.backgrounds.map((background, idx) =>
        idx === index
          ? {
              ...background,
              ...updates,
            }
          : background
      );
      return {
        ...prev,
        hero: {
          ...prev.hero,
          backgrounds,
        },
      };
    });
  };

  const updateFocalPoint = (index: number, axis: 'x' | 'y', value: number) => {
    setDraft((prev) => {
      const backgrounds = prev.hero.backgrounds.map((background, idx) => {
        if (idx !== index) {
          return background;
        }

        const focalPoint = { x: 50, y: 50, ...background.focalPoint };
        return {
          ...background,
          focalPoint: {
            ...focalPoint,
            [axis]: value,
          },
        };
      });

      return {
        ...prev,
        hero: {
          ...prev.hero,
          backgrounds,
        },
      };
    });
  };

  const handleAddBackground = () => {
    setDraft((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        backgrounds: [
          ...prev.hero.backgrounds,
          {
            src: '',
            alt: 'New background visual',
          },
        ],
      },
    }));
  };

  const heroWordsValue = draft.hero.words.join('\n');
  const headlinersValue = draft.event.headliners.join('\n');
  const aboutValue = draft.about.paragraphs.join('\n\n');
  const hoursValue = draft.about.hours.join('\n');
  const contactCategoriesValue = draft.contact.categories.join('\n');

  return (
    <section className="admin-config" aria-labelledby="admin-config-title">
      <header className="admin-config__header">
        <div>
          <p className="admin-config__eyebrow">Site configuration</p>
          <h1 id="admin-config-title">Customer experience controls</h1>
          <p className="admin-config__intro">
            Update copy, backgrounds, CTAs, and modal content. Changes stay in draft until the admin APIs publish them to the
            live site.
          </p>
        </div>
        {saveNotice && <p className="admin-config__notice">{saveNotice}</p>}
      </header>
      <div className="admin-config__tabs" role="tablist" aria-label="Customer site sections">
        {(
          [
            { id: 'hero', label: 'Landing hero' },
            { id: 'event', label: 'Event experience' },
            { id: 'about', label: 'About modal' },
            { id: 'contact', label: 'Contact modal' },
            { id: 'footer', label: 'Footer & navigation' },
          ] as { id: ConfigurationTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-config__tab${activeTab === tab.id ? ' admin-config__tab--active' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="admin-config__panels">
        {activeTab === 'hero' && (
          <form className="admin-config__form" onSubmit={handleHeroSubmit} role="tabpanel" aria-label="Landing hero">
            <fieldset>
              <legend>Brand &amp; marquee</legend>
              <label>
                Club name
                <input
                  value={draft.hero.name}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, name: event.target.value },
                    }))
                  }
                />
              </label>
              <label>
                Tagline
                <input
                  value={draft.hero.tagline}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, tagline: event.target.value },
                    }))
                  }
                />
              </label>
              <label>
                Rotating marquee words
                <textarea
                  value={heroWordsValue}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        words: event.target.value
                          .split('\n')
                          .map((word) => word.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  rows={4}
                />
                <span className="admin-config__hint">Enter one word per line.</span>
              </label>
            </fieldset>
            <fieldset>
              <legend>Background loop</legend>
              <p className="admin-config__hint">
                Reorder by dragging in the future build. For now update URLs, alt text, and focal points to optimise the loop.
              </p>
              {draft.hero.backgrounds.map((background, index) => (
                <div key={index} className="admin-config__background">
                  <h3>Layer {index + 1}</h3>
                  <label>
                    Media URL
                    <input
                      value={background.src}
                      onChange={(event) => updateBackground(index, { src: event.target.value })}
                      placeholder="https://cdn.example.com/hero/visual.mp4"
                    />
                  </label>
                  <label>
                    Alt text / description
                    <input
                      value={background.alt}
                      onChange={(event) => updateBackground(index, { alt: event.target.value })}
                      placeholder="Describe the scene for accessibility"
                    />
                  </label>
                  <div className="admin-config__focal">
                    <label>
                      Focal X (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={background.focalPoint?.x ?? 50}
                        onChange={(event) => updateFocalPoint(index, 'x', Number(event.target.value))}
                      />
                    </label>
                    <label>
                      Focal Y (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={background.focalPoint?.y ?? 50}
                        onChange={(event) => updateFocalPoint(index, 'y', Number(event.target.value))}
                      />
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" className="admin-config__add" onClick={handleAddBackground}>
                Add background layer
              </button>
            </fieldset>
            <fieldset>
              <legend>CTA labels</legend>
              <div className="admin-config__grid">
                <label>
                  Events overlay
                  <input
                    value={draft.nav.events}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        nav: { ...prev.nav, events: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Reserve overlay
                  <input
                    value={draft.nav.reserve}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        nav: { ...prev.nav, reserve: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Ticket overlay
                  <input
                    value={draft.nav.ctaTicket}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        nav: { ...prev.nav, ctaTicket: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Contact overlay
                  <input
                    value={draft.nav.ctaContact}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        nav: { ...prev.nav, ctaContact: event.target.value },
                      }))
                    }
                  />
                </label>
              </div>
            </fieldset>
            <footer className="admin-config__actions">
              <button type="submit" className="admin-config__save">
                Save hero draft
              </button>
            </footer>
          </form>
        )}
        {activeTab === 'event' && (
          <form className="admin-config__form" onSubmit={handleEventSubmit} role="tabpanel" aria-label="Event experience">
            <fieldset>
              <legend>Event details</legend>
              <label>
                Event name
                <input
                  value={draft.event.name}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      event: { ...prev.event, name: event.target.value },
                    }))
                  }
                />
              </label>
              <div className="admin-config__grid">
                <label>
                  Starts at
                  <input
                    type="datetime-local"
                    value={draft.event.start}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        event: { ...prev.event, start: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Ends at
                  <input
                    type="datetime-local"
                    value={draft.event.end}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        event: { ...prev.event, end: event.target.value },
                      }))
                    }
                  />
                </label>
              </div>
              <label>
                Flyer image URL
                <input
                  value={draft.event.flyer}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      event: { ...prev.event, flyer: event.target.value },
                    }))
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  value={draft.event.description}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      event: { ...prev.event, description: event.target.value },
                    }))
                  }
                  rows={4}
                />
              </label>
              <label>
                Headliners (one per line)
                <textarea
                  value={headlinersValue}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      event: {
                        ...prev.event,
                        headliners: event.target.value
                          .split('\n')
                          .map((value) => value.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  rows={3}
                />
              </label>
            </fieldset>
            <fieldset>
              <legend>Ticketing &amp; CTA copy</legend>
              <label className="admin-config__toggle">
                <input
                  type="checkbox"
                  checked={draft.event.requiresTicket}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      event: { ...prev.event, requiresTicket: event.target.checked },
                    }))
                  }
                />
                Requires pre-sale ticket
              </label>
              <label>
                Ticket URL (if applicable)
                <input
                  value={draft.event.ticketUrl}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      event: { ...prev.event, ticketUrl: event.target.value },
                    }))
                  }
                />
              </label>
              <label>
                Table hotline
                <input
                  value={draft.event.tableHotline}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      event: { ...prev.event, tableHotline: event.target.value },
                    }))
                  }
                />
              </label>
              <div className="admin-config__grid">
                <label>
                  Flyer eyebrow
                  <input
                    value={draft.event.flyerEyebrow}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        event: { ...prev.event, flyerEyebrow: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Close button label
                  <input
                    value={draft.event.closeLabel}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        event: { ...prev.event, closeLabel: event.target.value },
                      }))
                    }
                  />
                </label>
              </div>
            </fieldset>
            <footer className="admin-config__actions">
              <button type="submit" className="admin-config__save">
                Save event draft
              </button>
            </footer>
          </form>
        )}
        {activeTab === 'about' && (
          <form className="admin-config__form" onSubmit={handleAboutSubmit} role="tabpanel" aria-label="About modal">
            <fieldset>
              <legend>Story content</legend>
              <label>
                Title
                <input
                  value={draft.about.title}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      about: { ...prev.about, title: event.target.value },
                    }))
                  }
                />
              </label>
              <label>
                Subtitle
                <input
                  value={draft.about.subtitle}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      about: { ...prev.about, subtitle: event.target.value },
                    }))
                  }
                />
              </label>
              <label>
                Narrative paragraphs
                <textarea
                  value={aboutValue}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      about: {
                        ...prev.about,
                        paragraphs: event.target.value
                          .split('\n\n')
                          .map((paragraph) => paragraph.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  rows={6}
                />
                <span className="admin-config__hint">Separate paragraphs with a blank line.</span>
              </label>
              <label>
                Operating hours (one per line)
                <textarea
                  value={hoursValue}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      about: {
                        ...prev.about,
                        hours: event.target.value
                          .split('\n')
                          .map((value) => value.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  rows={3}
                />
              </label>
            </fieldset>
            <footer className="admin-config__actions">
              <button type="submit" className="admin-config__save">
                Save about draft
              </button>
            </footer>
          </form>
        )}
        {activeTab === 'contact' && (
          <form className="admin-config__form" onSubmit={handleContactSubmit} role="tabpanel" aria-label="Contact modal">
            <fieldset>
              <legend>Contact routing</legend>
              <label>
                Title
                <input
                  value={draft.contact.title}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, title: event.target.value },
                    }))
                  }
                />
              </label>
              <label>
                Subtitle / instructions
                <textarea
                  value={draft.contact.subtitle}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, subtitle: event.target.value },
                    }))
                  }
                  rows={3}
                />
              </label>
              <label>
                Enquiry categories (one per line)
                <textarea
                  value={contactCategoriesValue}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        categories: event.target.value
                          .split('\n')
                          .map((value) => value.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  rows={3}
                />
              </label>
              <label>
                Confirmation message
                <textarea
                  value={draft.contact.confirmation}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, confirmation: event.target.value },
                    }))
                  }
                  rows={2}
                />
              </label>
            </fieldset>
            <footer className="admin-config__actions">
              <button type="submit" className="admin-config__save">
                Save contact draft
              </button>
            </footer>
          </form>
        )}
        {activeTab === 'footer' && (
          <form className="admin-config__form" onSubmit={handleFooterSubmit} role="tabpanel" aria-label="Footer & navigation">
            <fieldset>
              <legend>Footer links</legend>
              <div className="admin-config__grid">
                <label>
                  Operating hours label
                  <input
                    value={draft.footer.operatingLabel}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, operatingLabel: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Legal label
                  <input
                    value={draft.footer.legalLabel}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, legalLabel: event.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Admin label
                  <input
                    value={draft.footer.adminLabel}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, adminLabel: event.target.value },
                      }))
                    }
                  />
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend>Social links</legend>
              {draft.footer.socials.map((link, index) => (
                <div key={link.url} className="admin-config__social">
                  <label>
                    Platform name
                    <input
                      value={link.name}
                      onChange={(event) =>
                        setDraft((prev) => {
                          const socials = prev.footer.socials.map((item, idx) =>
                            idx === index ? { ...item, name: event.target.value } : item
                          );
                          return {
                            ...prev,
                            footer: { ...prev.footer, socials },
                          };
                        })
                      }
                    />
                  </label>
                  <label>
                    URL
                    <input
                      value={link.url}
                      onChange={(event) =>
                        setDraft((prev) => {
                          const socials = prev.footer.socials.map((item, idx) =>
                            idx === index ? { ...item, url: event.target.value } : item
                          );
                          return {
                            ...prev,
                            footer: { ...prev.footer, socials },
                          };
                        })
                      }
                    />
                  </label>
                  <label>
                    Icon
                    <select
                      value={link.icon ?? 'instagram'}
                      onChange={(event) =>
                        setDraft((prev) => {
                          const socials = prev.footer.socials.map((item, idx) =>
                            idx === index ? { ...item, icon: event.target.value as FooterLink['icon'] } : item
                          );
                          return {
                            ...prev,
                            footer: { ...prev.footer, socials },
                          };
                        })
                      }
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="x">X / Twitter</option>
                    </select>
                  </label>
                </div>
              ))}
            </fieldset>
            <footer className="admin-config__actions">
              <button type="submit" className="admin-config__save">
                Save footer draft
              </button>
            </footer>
          </form>
        )}
      </div>
    </section>
  );
};
