/* Tip of the day.
   One sentence each, on training employees with disabilities in foodservice.

   Tips are grouped by theme. The themes are what the /tips/ page is built from,
   so a tip added to a group appears there automatically the next time the site
   is built with: node scripts/build-site.mjs

   The site shows one tip per calendar day. To keep consecutive days feeling
   varied, the daily order is a round robin across the themes rather than the
   reading order below, which is worked out at the bottom of this file.

   To add a tip, put another quoted line inside whichever group fits.
   To change one, edit it in place. Groups can be any length. */

window.SITE_TIP_GROUPS = [
  {
    slug: "plain-language",
    name: "Plain language and clear instructions",
    blurb: "Most training fails at the sentence level. These are about saying the thing so it can be acted on.",
    tips: [
      "Replace vague timing like “as needed” with a specific trigger, such as washing hands right after touching raw chicken.",
      "Replace “sanitize the surface” with the exact product, the exact steps, and the exact contact time.",
      "Use the same word for the same tool every time, because switching between “thermometer” and “temp probe” adds unnecessary work.",
      "Write job aids at the reading level of your newest employee, not at the level of the health inspector.",
      "Replace “keep it cold” with the number, because 41 degrees Fahrenheit is teachable and “cold” is not.",
      "Say what to do rather than what to avoid, because “hold the handle” is clearer than “do not drop it.”",
      "Replace long policy sentences with short ones, because one idea per sentence is easier to act on.",
      "Keep the training glossary short, and teach only the words the job actually requires.",
      "Replace “check the temperature regularly” with a named time and a place to record it.",
      "Explain why a rule exists, because reasons make rules stick better than repetition does.",
      "Avoid idioms in food safety instruction, because “keep an eye on it” is not a procedure.",
      "Remove the steps that do not matter, since a shorter procedure is a safer procedure.",
      "Read your own training document out loud, because sentences that are hard to say are hard to follow.",
      "Use one verb per instruction, because “rinse, wash, and then sanitize” is three tasks wearing one coat.",
      "Keep the language of your training and the language of your inspection checklist the same.",
      "State the standard as observable behavior, since “clean” is an opinion and “no visible residue” is not.",
      "Say what “done” looks like at the start, so the employee can judge their own work."
    ]
  },
  {
    slug: "demonstration",
    name: "Showing, practising and checking understanding",
    blurb: "Telling someone a procedure is not training them. These are about the loop between showing, doing and verifying.",
    tips: [
      "Show the task yourself first, then do it together, then watch the employee do it alone.",
      "Check understanding by asking the employee to show you the task, never by asking whether they understood.",
      "Let the employee practice taking temperatures on food that is not going to a guest, so the first attempt carries no pressure.",
      "Train in the space where the work happens, so the cues in the room become part of the memory.",
      "Ask the employee to teach the task back to you, because teaching reveals the gaps that nodding hides.",
      "Use real utensils and real equipment in training, not photographs of them.",
      "Practice the recovery step too, because knowing what to do after a mistake keeps the mistake from spreading.",
      "Train the cleaning schedule with the chemicals in hand rather than from a printed chart alone.",
      "Demonstrate at working speed once and then again slowly, because both versions teach something different.",
      "Use a mirror or a second angle when demonstrating a task that your own hands block from view."
    ]
  },
  {
    slug: "visual-supports",
    name: "Visual supports and job aids",
    blurb: "What is on the wall at the station does more work than what was said in the office last week.",
    tips: [
      "Post a photo sequence of correct handwashing above the sink instead of a paragraph of text.",
      "Give the employee the written steps to keep, because training that lives only in one conversation disappears by the next shift.",
      "Break handwashing into numbered steps and post the numbers, because a list is easier to follow than a sentence.",
      "Put a laminated step card at the station rather than in a binder in the office.",
      "Label the sanitizer bucket with the correct concentration so the standard is visible at the point of use.",
      "Give a printed schedule of what will be trained and when, so nobody has to hold the plan in memory.",
      "Put the allergen procedure on the wall where allergen orders are actually assembled.",
      "Test a job aid by handing it to someone who has never done the task and watching what happens.",
      "Use arrows and numbers on posted diagrams so the order of steps is impossible to misread.",
      "Use a checklist the employee physically marks off, because a mark is a stronger cue than memory.",
      "Keep a spare copy of every job aid, because the one at the station will eventually get wet.",
      "Photograph the correct setup of each station and post it where the setup happens.",
      "Ask the employee to review the job aid and tell you what is confusing before you finalize it.",
      "Use consistent icons across all your signage so meaning transfers between stations.",
      "Print in a large clear typeface and keep the contrast high, since a sign nobody can read is not a control.",
      "Update the job aid the day the procedure changes, not at the next review cycle.",
      "Post the number to call and the person to ask when something goes wrong mid shift.",
      "Break the closing routine into a numbered card, since fatigue is when steps get dropped."
    ]
  },
  {
    slug: "pacing",
    name: "Pacing, sequencing and cognitive load",
    blurb: "How much you ask someone to hold at once, and in what order, decides whether any of it survives the shift.",
    tips: [
      "Teach one food safety task at a time, and let the employee master it before you add the next one.",
      "Teach the steps in the order the work actually happens, not in the order the manual lists them.",
      "Schedule food safety training early in a shift rather than at the end of a long one.",
      "Give one instruction at a time and wait for it to be finished before you give the next.",
      "Review the same critical task on a schedule, because food safety skills fade for everyone without practice.",
      "Keep training sessions short and frequent rather than long and rare.",
      "Say the employee's name before you give an instruction, so attention is ready before the words arrive.",
      "Separate learning the task from being timed on the task, and do not combine the two too early.",
      "Allow extra time in the first weeks without treating that time as a concession.",
      "Return to the hardest task last in a session, when confidence from the earlier wins is available.",
      "Explain what happens after training ends, so the first solo shift is not a surprise.",
      "Let the employee set the pace of a first practice run.",
      "Space practice out across several days rather than packing it into one session.",
      "Keep the first day short and specific rather than comprehensive and overwhelming."
    ]
  },
  {
    slug: "food-safety-tasks",
    name: "Specific food safety tasks",
    blurb: "The particular procedures where clarity matters most, because these are the ones that make people ill when they go wrong.",
    tips: [
      "Color code the cutting boards and then actually teach the colors, because a system nobody explains is just decoration.",
      "Use a timer for handwashing rather than asking the employee to count in their head.",
      "Write dates on containers in the same format everywhere, because mixed formats create avoidable errors.",
      "Introduce the illness reporting policy on day one, and make clear that reporting is expected and protected.",
      "Say the number out loud when you demonstrate a temperature check, so the target enters the routine.",
      "Train the handoff between employees, because a great deal of cross contamination happens at the seams.",
      "Post the cooking temperatures for the items your kitchen actually serves, not a generic chart.",
      "Teach where the thermometer is stored and how it is calibrated, not only how it is read.",
      "Confirm understanding of the cooling procedure on its own, because it is the step most often rushed.",
      "Practice the glove change routine until it happens without deliberation.",
      "Teach the temperature danger zone with the two numbers rather than with the phrase alone.",
      "Rehearse what to do when a guest asks an allergen question the employee cannot answer.",
      "Make the sanitizer test strip procedure a demonstration rather than a description.",
      "Teach why a cutting board gets swapped before you teach which board to swap to."
    ]
  },
  {
    slug: "environment",
    name: "The physical environment and equipment",
    blurb: "A well trained employee can still be defeated by the room. These are the things to check before blaming the training.",
    tips: [
      "Confirm that the employee can reach the handwashing sink and its supplies without help.",
      "Reduce background noise during training when you can, because instructions compete with the room.",
      "Check that safety signage sits at eye level for the person who actually needs to read it.",
      "Confirm the thermometer display is readable to the employee before you build a task around it.",
      "Confirm that gloves are stocked in the sizes your team actually needs.",
      "Check that the employee can operate the equipment safely with the controls positioned as they are.",
      "Ask about barriers in the physical space, because the room can defeat a well trained employee.",
      "Keep date labels within reach of the station where the food is actually stored.",
      "Retrain after any equipment change, because habit is tied to the old machine.",
      "Provide quiet space for the parts of training that require real concentration."
    ]
  },
  {
    slug: "feedback",
    name: "Feedback, supervision and correction",
    blurb: "What happens after the training is what determines whether it held.",
    tips: [
      "Never deliver a food safety correction in front of guests or in front of the whole line.",
      "Treat a repeated mistake as a signal that the training design failed, not that the employee did.",
      "Give feedback on the specific step, because “you did that wrong” teaches nothing.",
      "Pair a new employee with a patient trainer rather than with the fastest one.",
      "Watch a full task from start to finish before you decide whether the training worked.",
      "Ask closed questions when you are checking a specific fact and open ones when you are checking understanding.",
      "Give new employees a named person to ask, because “ask anyone” often means asking no one.",
      "Praise the specific correct step, since specific praise teaches while general praise only comforts.",
      "Assign the same trainer through the whole onboarding whenever scheduling allows.",
      "Ask what the employee would do in a specific situation rather than what the policy says.",
      "Match your training records to what was actually demonstrated, not to what was merely covered.",
      "Watch for the step an employee skips consistently, because that is where the instruction is unclear."
    ]
  },
  {
    slug: "accommodations",
    name: "Accommodations and how you handle them",
    blurb: "Adjustments work best when they are ordinary planning rather than an exception someone has to request.",
    tips: [
      "Ask the employee how they learn best before you design the training, because most people already know the answer.",
      "Build the accommodation into the standard training so that no one has to ask for it separately.",
      "Ask what has worked in the employee's previous jobs before you assume nothing has.",
      "Offer the material in more than one format, because reading, watching, and doing reach different people.",
      "Ask what time of day the employee works best, and train then when the schedule allows.",
      "Record the accommodation in writing so it survives a change in shift supervisor.",
      "Treat the accommodation conversation as ordinary planning rather than as a special favor.",
      "Give written confirmation of what was trained and when, for the employee as much as for the file.",
      "Let the employee choose whether to be trained alone or alongside others.",
      "Revisit accommodations after the first month, since needs change once the job becomes familiar."
    ]
  },
  {
    slug: "culture",
    name: "Dignity, culture and involving the team",
    blurb: "Training happens inside a relationship. These are about the conditions that make someone willing to say they did not follow.",
    tips: [
      "Assume a quiet employee is processing rather than disengaged, and give the extra few seconds.",
      "Ask before you help with a physical task, because assistance offered without asking can undercut confidence.",
      "Give the employee explicit permission to ask for a step to be repeated, and mean it.",
      "Let the employee keep a personal cue card in a pocket without treating it as a weakness.",
      "Ask the employee to identify the riskiest step in their own station, and listen to the answer.",
      "Give the employee the same uniform, tools, and station standards as everyone else.",
      "Ask the employee to choose where the reminder card goes, since they know their own sightlines.",
      "Give the employee a way to signal that they need a moment without having to explain why.",
      "Model asking a question in front of the team, since permission is easier to believe once it is demonstrated.",
      "Talk with the employee about their training needs, not with a family member or job coach on their behalf.",
      "Ask whether the employee has found an easier way to do the task, because the workaround is often an improvement.",
      "Ask the whole team what is unclear, because the accommodation that helps one person usually helps several.",
      "Give the same depth of explanation to every employee rather than a shortened version to some.",
      "Ask an employee who has learned the task to help you improve how it is taught.",
      "Design the training you would want if you were learning this job on your own first day."
    ]
  }
];

/* Reading order. The themes flattened, in the order they appear above. This is
   the canonical numbering used on the /tips/ page and on the daily card, so
   "Tip 42" always means the same sentence. */
window.SITE_TIPS_ORDERED = window.SITE_TIP_GROUPS.reduce(function (all, g) {
  return all.concat(g.tips);
}, []);

/* Daily order. A round robin across the themes, so two consecutive days do not
   land on the same subject. Deterministic, so every visitor sees the same tip
   on the same date. */
window.SITE_TIPS = (function (groups) {
  var out = [];
  var lists = groups.map(function (g) { return g.tips; });
  var max = Math.max.apply(null, lists.map(function (l) { return l.length; }));
  for (var i = 0; i < max; i++) {
    for (var g = 0; g < lists.length; g++) {
      if (i < lists[g].length) out.push(lists[g][i]);
    }
  }
  return out;
})(window.SITE_TIP_GROUPS);
